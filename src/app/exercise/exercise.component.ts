import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { ExerciseService } from '../exercise.service';

import { Exercise } from '../exercise';
import { Discussion } from '../discussion';
import { User } from '../user';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit {
  exercise: Exercise;
  showDiscussion: Boolean = false;
  discussionUnlocked: Boolean = false;
  discussions: Discussion[];
  discussion = {
    author: '',
    title: '',
    body: '',
    summary: '',
    summaryAuthorUID: '',
    concerned: [],
    solved: false,
  }
  exercise_id: string;

  // FOR DISCUSSION PROMPT
  noDiscussion = false;
  noParticipation = false;
  prompts = [
    'Any problems understanding the terms?',
    'What is to like about this exercise?',
    'Any questions on how this relates to an application?',
    'Is something unclear?',
    'Is there more to discuss about?',
    'What was interesting about this exercise?',
    'Why can this exercise be hard?'
  ]
  prompt: string;

  getRandomPrompt(): string {
    var p_ind = Math.floor(Math.random() * this.prompts.length);
    return this.prompts[p_ind];
  }

  constructor(
    private exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: NgbModal
  ) { }

  exerciseId(): string {
    return this.route.snapshot.paramMap.get('exercise_id');
  }

  getData(): void {
    var id = this.route.snapshot.paramMap.get('exercise_id');
    this.exercise_id = id;
    this.exerciseService.getExercise(id).subscribe(e => {
      this.exercise = e;
    });
    this.exerciseService.getDiscussions(id).subscribe(d => {
      this.discussions = d.sort((a, b) => b.concerned.length - a.concerned.length)
      this.noDiscussion = (this.discussions.length < 1)
      this.noParticipation = (this.discussions.filter(d => d.author == this.exerciseService.userUID).length < 1)

      if (this.discussions.filter(d => d.author != this.exerciseService.userUID).length > 0) {
        this.exerciseService.getUser(this.exerciseService.userUID).subscribe(u => {
          this.discussionUnlocked = (u[0].unlocked.indexOf(id) > -1)
        });
      } else {
        this.discussionUnlocked = true;
      }
    });
    console.log(this.exerciseService.userUID)
  }

  saveDiscussion(): void {
    var id = this.route.snapshot.paramMap.get('exercise_id');
    this.exerciseService.addDiscussion(id, this.discussion);
    this.exerciseService.updateMastery(this.exercise.tags[0], 'd')
    this.exerciseService.modifyCoins(2);
  }

  checkLength(): boolean {
    if (this.discussion.title.length > 10 && this.discussion.body.length > 30) {
      return true
    }
    return false
  }

  open(content) {
    this.modalService.open(content);
  }

  randomPrompt

  ngOnInit() {
    this.getData();
    this.prompt = this.getRandomPrompt()
    this.randomPrompt = setInterval(() => {
      this.prompt = this.getRandomPrompt()
    }, 30000);
  }

  ngOnDestroy() {
    if (this.randomPrompt) {
      clearInterval(this.randomPrompt);
    }  }

  goBack(): void {
    this.location.back();
  }

  unlockDiscussion(): void {
    if (!this.showDiscussion) {
      if (!this.discussionUnlocked && this.exerciseService.user.coins > 0 && this.exerciseService.user.unlocked.indexOf(this.exercise_id) == -1) {
        this.exerciseService.modifyCoins(-1);
        this.exerciseService.addPonderingUser(this.exercise_id, this.exercise);
        this.exerciseService.addUnlockedExercise(this.exercise_id);
        this.discussionUnlocked = true;
        this.showDiscussion = !this.showDiscussion;
      } else if (this.discussionUnlocked || (this.exerciseService.user.unlocked.indexOf(this.exercise_id) > -1)) {
        this.showDiscussion = !this.showDiscussion;
      } else if (this.exerciseService.user.coins < 1) {
        alert("Not enough coins. You need 1 coin to unlock discussions.");
      }
    } else {
      this.showDiscussion = !this.showDiscussion;
    }
  }
}
