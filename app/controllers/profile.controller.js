const Profile = require("../models/profile.model.js");
const { hashSync, genSaltSync } = require("bcrypt");

// Generate bcrypt salt
var salt = genSaltSync(10);

// Change password for userId (admin)
exports.changePassword = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Profile.changePassword(req.headers.authorization, req.body.userId, hashSync(req.body.newPassword, salt), (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId} or you are not allowed for this operation.`
          });
        } else {
          res.status(500).send({
            message: "Error changing the password for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Find profile infos
exports.infos = (req, res) => {
  Profile.infos(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No user found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile projects
exports.projects = (req, res) => {
  Profile.projects(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No projects found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile roles
exports.roles = (req, res) => {
  Profile.roles(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No role found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving roles for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile genres
exports.genres = (req, res) => {
  Profile.genres(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No genre found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving genres for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile followers
exports.followers = (req, res) => {
  Profile.followers(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No followers found for username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving followers for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile following
exports.following = (req, res) => {
  Profile.following(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `${req.params.username} is not following anyone`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving following users for " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile inspired users
exports.inspired = (req, res) => {
  Profile.inspired(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `${req.params.username} has no inspired users`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving inspired users for " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Follow profile
exports.follow = (req, res) => {
  Profile.follow(req.headers.authorization, req.params.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile with id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: "Error following profile with id " + req.body.profileId
          });
        }
    } else res.send(data);
  });
};

// Unfollow profile
exports.unfollow = (req, res) => {
  Profile.unfollow(req.headers.authorization, req.params.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found followed user with id ${req.params.profileId}.`
          });
        } else {
          res.status(500).send({
            message: "Error unfollowing profile with id " + req.params.profileId
          });
        }
    } else res.send(data);
  });
};

// Check if logged user follows the profile based on username
exports.checkFollow = (req, res) => {
  Profile.checkFollow(req.headers.authorization, req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          following: false
        });
      } else {
        res.status(500).send({
          message: "Error checking if user follows " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Update inspiration status on followed user profile
exports.updateInspiration = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Profile.updateInspiration(req.headers.authorization, req.body.id, req.body.followedId, req.body.option, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found following infos with id ${req.body.profileId}`
          });
        } else {
          res.status(500).send({
            message: `Error updating following infos with id ${req.body.profileId}`
          });
        }
    } else res.send(data);
  });
};

// Find profile posts
exports.posts = (req, res) => {
  Profile.posts(req.headers.authorization, req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No posts found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving posts for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile strengths
exports.strengths = (req, res) => {
  Profile.strengths(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No strengths found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving strengths for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile total votes by strengths
exports.strengthsByTotalVotes = (req, res) => {
  Profile.strengthsTotalVotes(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No strengths found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving strengths for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile recent strength votes by other users
exports.strengthsRecentVotes = (req, res) => {
  Profile.strengthsRecentVotes(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No votes found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving votes for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile strengths
exports.strengthsRaw = (req, res) => {
  Profile.strengthsRaw(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No strengths found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving strengths for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Vote for profile strength
exports.voteStrength = (req, res) => {
  Profile.voteStrength(req.headers.authorization, req.body.strengthId, req.body.strengthTitle, req.body.profileId, req.body.nameTo, req.body.emailTo, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: "Error voting strength for profile id " + req.body.profileId
          });
        }
    } else res.send(data);
  });
};

// Unvote profile strength
exports.unvoteStrength = (req, res) => {
  Profile.unvoteStrength(req.headers.authorization, req.params.voteId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found vote with voteId ${req.params.voteId}.`
          });
        } else {
          res.status(500).send({
            message: "Error unvoting for with voteId " + req.params.profileId
          });
        }
    } else res.send(data);
  });
};

// Find profile gear
exports.gear = (req, res) => {
  Profile.gear(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile gear item info
exports.gearItem = (req, res) => {
  Profile.gearItem(req.params.username, req.params.itemId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No item found with id ${req.params.itemId} on gear for username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving item ${req.params.itemId} for username ${req.params.username}`
        });
      }
    } else res.send(data);
  });
};

// Find profile gear subitens of a item
exports.gearSubItems = (req, res) => {
  Profile.gearSubItems(req.params.username, req.params.parentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No sub items found for ${req.params.parentId} of username ${req.params.username}`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving sub items for ${req.params.parentId} of username ${req.params.username}`
        });
      }
    } else res.send(data);
  });
};

// Find profile gear setups
exports.gearSetups = (req, res) => {
  Profile.gearSetups(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear setup found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear setups for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile gear setup info
exports.gearSetup = (req, res) => {
  Profile.gearSetup(req.params.username, req.params.setupId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No setup found with id ${req.params.itemId} on gear for username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving setup ${req.params.itemId} for username ${req.params.username}`
        });
      }
    } else res.send(data);
  });
};

// Find profile gear setup products
exports.gearSetupProducts = (req, res) => {
  Profile.gearSetupProducts(req.params.username, req.params.setupId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear setup product found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear setups products for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile availability items
exports.availabilityItems = (req, res) => {
  Profile.availabilityItems(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No availability items found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving availability items for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile testimonials
exports.testimonials = (req, res) => {
  Profile.testimonials(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No testimonials found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving testimonials for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Submit new Testimonial
exports.newTestimonial = (req, res) => {
  Profile.newTestimonial(req.headers.authorization, req.body.testimonialTitle, req.body.testimonialText, req.body.profileId, req.body.nameTo, req.body.emailTo, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: `Error submitting testimonial to profile id ${req.body.profileId}`
          });
        }
    } else res.send(data);
  });
};

// Update my testimonial on user profile
exports.updateTestimonial = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Profile.updateTestimonial(req.headers.authorization, req.body.testimonialId, req.body.testimonialTitle, req.body.testimonialText, req.body.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: `Error updating testimonial to profile id ${req.body.profileId}`
          });
        }
    } else res.send(data);
  });
};

// Unvote profile strength
exports.deleteTestimonial = (req, res) => {
  Profile.deleteTestimonial(req.headers.authorization, req.body.testimonialId, req.body.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: `Error deleting testimonial from profile id ${req.body.profileId}`
          });
        }
    } else res.send(data);
  });
};

// Find profile partners
exports.partners = (req, res) => {
  Profile.partners(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No partners found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving partners for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile related other users
exports.relatedUsers = (req, res) => {
  Profile.relatedUsers(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No related users found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving related users for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};
