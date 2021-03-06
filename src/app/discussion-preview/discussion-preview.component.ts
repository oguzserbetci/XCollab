import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ExerciseService } from '../exercise.service';
import { Discussion } from '../discussion';
import { Exercise } from '../exercise';
import { User } from '../user';

@Component({
  selector: 'app-discussion-preview',
  templateUrl: './discussion-preview.component.html',
  styleUrls: ['./discussion-preview.component.scss']
})
export class DiscussionPreviewComponent implements OnInit {
  @Input('discussion') discussion: Discussion;
  @Input('exercise') exercise: Exercise;
  exercise_id: string;
  user: User;
  mastery: number;
  isConcerned: boolean;

  constructor(
    public exerciseService: ExerciseService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) { }

  commentsUnlocked() {
    return (this.exerciseService.user.unlocked.indexOf(this.discussion.id) > -1) || (this.discussion.author == this.exerciseService.userUID)
  }

  getData(): void {
    const user_uid = this.discussion.author;
    this.exerciseService.getUser(user_uid).subscribe((user) => {
      this.user = user[0];
      this.mastery = this.exerciseService.getMastery(this.exercise, user[0])
    });
    console.log('discussion comments unlocked?: ', this.commentsUnlocked())
    this.isConcerned = this.exerciseService.isConcerned(this.discussion)
  }

  openComments() {
    if (this.commentsUnlocked()) {
      this.router.navigate(['exercise/' + this.exercise_id + '/discussion/' + this.discussion.id]);
    } else {
      console.log("You need to unlock the discussion.")
    }
  }

  unlockComments() {
    if(this.exerciseService.user.coins > 0 && !this.commentsUnlocked()) {
      this.exerciseService.modifyCoins(-1);
      this.exerciseService.addUnlockedDiscussion(this.discussion.id);
      this.router.navigate(['exercise/' + this.exercise_id + '/discussion/' + this.discussion.id]);
      console.log("goes to comments - just unlocked")
    } else if (this.commentsUnlocked()) {
        console.log("goes to comments - already unlocked")
        this.router.navigate(['exercise/' + this.exercise_id + '/discussion/' + this.discussion.id]);
    } else if (this.exerciseService.user.coins < 1) {
      console.log("Not enough coins. You need 1 coin to unlock comments for a discussion.");
    }
  }

  report() {
    alert("The comment has been reported, thank you :)")
  }

  ngOnInit() {
    this.exercise_id = this.route.snapshot.paramMap.get('exercise_id');
    this.getData();
  }
  test() {
    console.log('test')
    console.log(this.user, this.discussion)
  }

}
