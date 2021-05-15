import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocialUser } from 'angularx-social-login';

import { CustomAuthService } from '@app/services/custom-auth.service';
import { SignalRWaruSkiesService } from '@app/services/signal-r-waru-skies.service';

import { Dice } from '@app/models/dice';
import { DiceService } from '@app/services/dice.service';
import { DiceSetCollection } from '@app/data/diceSetCollection';
import { GameGroup } from '../../models/game-group.model';
import { GameState } from '../../models/game-state.model';
import { GameUpdateType } from '../../models/game-update-type';

@Component({
  selector: 'app-waru-skies-game',
  templateUrl: './waru-skies-game.component.html',
  styleUrls: ['./waru-skies-game.component.scss']
})
export class WaruSkiesGameComponent implements OnInit, OnDestroy {
  
  public user: SocialUser;
  public playerDiceSet: Dice[];
  public diceSetKey: string = "coin";

  private diceService: DiceService;
  private diceSetCollection: DiceSetCollection = new DiceSetCollection;

  public stepsProgress: number;
  private gameWon: boolean;
  
  groupUsers: SocialUser[] = [];
  defaultGroupId: string = 'waru-skies-game-room';
  groupId: string = '';
  gameGroup: GameGroup;
  
  gameGroupSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private customAuthService: CustomAuthService,
    public signalRService: SignalRWaruSkiesService
  ) { }

  ngOnInit(): void {
    this.playerDiceSet = this.playerDiceSet = [
      this.diceSetCollection[this.diceSetKey].dices[0]
    ];

    this.user = this.customAuthService.getUser();

    this.stepsProgress = 0;
    this.gameWon = false;
    
    this.route.params.subscribe(params => {
      
      this.groupId = params.id || this.defaultGroupId;
      this.signalRService.userJoinedGroup(this.groupId);        
      this.gameGroupSubscription = this.signalRService.gameGroup$.subscribe((gameGroup) => {
        if (gameGroup) {
          this.gameGroup = gameGroup;
          this.updateUsers();
        }
      });
        
    });
  }

  ngOnDestroy(): void {
    // if (this.appSettingsSubscription) this.appSettingsSubscription.unsubscribe();
    if (this.gameGroupSubscription) this.gameGroupSubscription.unsubscribe();
  }
  
  public updateUsers(): void {
    // Get list of users from chat history, start with chat users
    if (!this.gameGroup){
      return;
    }

    this.groupUsers = this.gameGroup.users.slice();
  }

  public getGameStates(): GameState[] {
    return this.gameGroup.gameStates;
  }

  getPlayerDiceSet(): Dice[] {
    return this.playerDiceSet;
  }
  
  resetGame(): void {
    this.signalRService.UpdateGame(this.groupId, GameUpdateType.ResetGame);
  }

  // Get a new set of dice
  // TODO: opportunities to refactor this below, but for now it's "okay"
  rollDice() {
    var diceSet = this.diceSetCollection[this.diceSetKey].dices;
    var maxLength = diceSet.length;
    for (let i = 0; i < this.playerDiceSet.length; i++) {
      let randomIndex = this.randomIntFromInterval(1, maxLength);
      this.playerDiceSet[i] = diceSet[randomIndex - 1];

      if (randomIndex == 1) {
        var userGameState = this.gameGroup.gameStates.filter(gameState => {
          return gameState.user.email.toLowerCase() == this.user.email.toLowerCase();
        });

        if (userGameState && userGameState.length) {
          var newProgress = userGameState[0].progress + 1;
          this.SendUpdate(newProgress);
        }
      }
    }
  }

  // Random number generator, min and max included.
  randomIntFromInterval(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  public userPhotoSrcUrl(user: SocialUser): string {
    return user.photoUrl ?? '../../../assets/default_avatar.JPG';
  }

  public userOnline(user: SocialUser): boolean {
    var foundIndex = this.gameGroup.activeUsersByEmail.findIndex(activeUserEmail => activeUserEmail.toLowerCase() == user.email.toLowerCase());
    return foundIndex >= 0;
  }
  
  public SendUpdate(progressValue: number): void {
    this.signalRService.UpdateGroup(this.groupId, progressValue);
  }
}
