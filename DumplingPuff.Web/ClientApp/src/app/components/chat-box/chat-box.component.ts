import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocialUser } from 'angularx-social-login';

import { AppSettingsService } from '../../services/app-settings.service';
import { ChatService } from '../../services/chat.service';
import { CustomAuthService } from '../../services/custom-auth.service';
import { SignedInUserService } from 'src/app/services/signed-in-user.service';

import { AppSettings } from '../../models/app-settings.model';
import { ChatMessage } from '../../models/chat-message.model';
import { switchMap } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {
  appSettings: AppSettings;
  clearChatHistory: string;  
  chatHistory: ChatMessage[] = [];
  chatMessage: string = '';
  userSearch: string = '';
  user: SocialUser;
  users: SocialUser[] = [];
  selectedUsers: SocialUser[] = [];

  @ViewChild('chatContainerScroll', { read: ElementRef }) public scroll: ElementRef<any>;
  @ViewChild('chatInputBox', { read: ElementRef }) public chatInputBox: ElementRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appSettingsService: AppSettingsService,
    private authService: CustomAuthService,
    public chatService: ChatService,
    public signedInUserService: SignedInUserService) { }

    ngOnInit() {
      this.clearChatHistory = this.route.snapshot.paramMap.get('clearChatHistory');
      if (!!this.clearChatHistory && this.clearChatHistory.toLocaleLowerCase() == 'true'){
        this.chatService.deleteChatHistory();
      }
  
      this.appSettingsService.appSettings.subscribe(appSettings => {
        this.appSettings = appSettings;
      })

      this.authService.getCurrentUser().subscribe((data) => {
        this.user = data;
      });
      
      this.signedInUserService.getUsers().subscribe((data) =>{
        this.users = data;
      });

      this.chatService.getChatHistory().subscribe((data) => {
        this.chatInputBox.nativeElement.focus();
      });
      
      if (!this.user) {
        alert("Please log in first, thanks!.");
        this.router.navigate(['home']);
      }
    }

    public getFormattedDateTime(dateValue: Date): string {
      return moment(dateValue).format('llll');
    }
  
    public getFormattedUserTime(): string {
      return moment().format('h:mm:ss a')
    }

    public filteredUsers(): SocialUser[] {

      if (!this.userSearch || this.userSearch.trim() == '') {
        return this.users;
      }

      var lowerCaseSearchTerm = this.userSearch.toLowerCase();
      var filteredList = this.users.filter(user => {
         return user.name.toLowerCase().includes(lowerCaseSearchTerm);
      });

      return filteredList;
    }

    // Add or remove toggled user
    public selectedUserClick(toggledUser: SocialUser): void {
      var filteredList = this.selectedUsers.filter(user => toggledUser.email.toLowerCase() == user.email.toLowerCase());

      if (!filteredList.length) {
        this.selectedUsers.push(toggledUser);
      } else {
        this.selectedUsers.splice(this.selectedUsers.findIndex(user => toggledUser.email.toLowerCase() == user.email.toLowerCase()), 1)
      }
    }

    public chatClick() {    
      if (this.chatMessage == ''){
        return;
      }
  
      var apiChatMessage = new ChatMessage();
      apiChatMessage.user = this.user;
      apiChatMessage.message = this.chatMessage;
      apiChatMessage.dateSent = new Date();
      
      this.chatService.postChatMessage(apiChatMessage).subscribe((data) => {
        this.scrollBottom();
        this.chatInputBox.nativeElement.focus();
      });
  
      this.chatMessage = '';
    }
  
    public scrollBottom() {
      this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
      //this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight - this.scroll.nativeElement.clientHeight;
    }
  }
  