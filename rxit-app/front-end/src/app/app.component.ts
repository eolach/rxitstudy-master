import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BlogPostService } from './blog_post.service';
import { UserService } from './user.service';
import { throwError } from 'rxjs';  // Angular 6/RxJS 6

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  authorized = false;
  /**
  * An object representing the user for the login form
  */
  public user: any;

  /**
   * An array of all the BlogPost objects from the API
   */
  public posts;

  /**
   * An object representing the data in the "add" form
   */
  public new_post: any;

  loginForm: FormGroup;

  constructor(
    public _blogPostService: BlogPostService,
    public _userService: UserService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.getPosts();
    this.new_post = {};
    this.user = {
      username: '',
      password: ''
    }
    this.loginForm = this.fb.group({
      username: [this.user.username, Validators.required],
      password: [this.user.password, Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }


  login() {
    this._userService.login({'username':this.f.username.value, 'password':this.f.password.value});
  }

  refreshToken() {
    this._userService.refreshToken();
  }

  logout() {
    this._userService.logout();
  }

  getPosts() {
    this._blogPostService.list().subscribe(
      // the first argument is a function which runs on success
      data => {
        this.posts = data;
        // convert the dates to a nice format
        for (let post of this.posts) {
          post.date = new Date(post.date);
        }
      },
      // the second argument is a function which runs on error
      err => console.error(err),
      // the third argument is a function which runs on completion
      () => console.log('done loading posts')
    );
  }

  createPost() {
    this._blogPostService.create(this.new_post, this.user.token).subscribe(
      data => {
        // refresh the list
        this.getPosts();
        return true;
      },
      error => {
        console.error('Error saving!');
        return throwError(error);
      }
    );
  }

}
