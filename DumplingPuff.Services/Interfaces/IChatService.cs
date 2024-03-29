﻿using System.Collections.Generic;
using DumplingPuff.Models;
using DumplingPuff.Models.Chat;

namespace DumplingPuff.Services.Interfaces
{
    public interface IChatService
    {
        List<ChatGroup> GetChatGroups();
        ChatGroup GetChatGroup(string chatGroupName);
        void AddUser(string groupId, SocialUser user);
        void RemoveUser(string groupId, SocialUser user);
        void AddChatMessageToGroup(string chatGroupName, ChatMessage message);
        void ClearChatGroupMessages(string chatGroupName);
    }
}