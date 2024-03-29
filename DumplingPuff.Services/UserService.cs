﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DumplingPuff.DataAccess.Repository.Interfaces;
using DumplingPuff.EntityModels.DumplingPuff;
using DumplingPuff.Models;
using DumplingPuff.Models.Utilities;
using DumplingPuff.Services.Interfaces;

namespace DumplingPuff.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public SocialUser GetByEmail(string email, string provider)
        {
            var entity = _userRepository
                .GetAll()
                .Where(u => u.Email.Equals(email, StringComparison.InvariantCultureIgnoreCase) && u.Provider.Equals(provider, StringComparison.InvariantCultureIgnoreCase))
                .FirstOrDefault();

            return entity == null
                ? null
                : new SocialUser
                {
                    InternalId = entity.Id,
                    Provider = entity.Provider,
                    Id = entity.SocialUserId,
                    Email = entity.Email,
                    Name = entity.Name,
                    PhotoUrl = entity.PhotoUrl,
                    FirstName = entity.FirstName,
                    LastName = entity.LastName
                };
        }

        public void AddOrUpdate(SocialUser user)
        {
            var entity = _userRepository
                .GetAll()
                .Where(u => u.Email.Equals(user.Email, StringComparison.InvariantCultureIgnoreCase) && u.Provider.Equals(user.Provider, StringComparison.InvariantCultureIgnoreCase))
                .FirstOrDefault();

            if (entity == null)
            {
                var userEntity = new UserEntity
                {
                    Id = 0,
                    Provider = user.Provider.Truncate(50),
                    SocialUserId = user.Id.Truncate(255),
                    Email = user.Email.Truncate(255),
                    Name = user.Name.Truncate(255),
                    PhotoUrl = user.PhotoUrl.Truncate(255),
                    FirstName = user.FirstName.Truncate(255),
                    LastName = user.LastName.Truncate(255),
                    DateCreated = DateTime.Now,
                    DateUpdated = DateTime.Now,
                    DateLastLogin = DateTime.Now
                };
                _userRepository.AddOrUpdate(userEntity);
            }
            else
            {
                entity.DateLastLogin = DateTime.Now;
                _userRepository.AddOrUpdate(entity);
            }
        }
    }
}
