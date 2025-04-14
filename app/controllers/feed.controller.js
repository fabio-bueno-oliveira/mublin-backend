const Feed = require("../models/feed.model.js");

// get user feed
exports.feed = (req, res) => {
  Feed.feed(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed events for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed events for logged user."
        });
      }
    } else res.send(data);
  });
};

// get simple feed (only users posts)
exports.simpleFeed = (req, res) => {
  Feed.simpleFeed(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed events for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed events for logged user."
        });
      }
    } else res.send(data);
  });
};

// new post
exports.newPost = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save post in database
  Feed.newPost(req.headers.authorization, req.body.id_item_fk, req.body.related_item_type, req.body.id_feed_type_fk, req.body.text, req.body.image, req.body.video_url, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting to feed."
      });
    else res.send(data);
  });
};

// delete feed item
exports.deleteFeedItem = (req, res) => {
  Feed.deleteFeedItem(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item"
        });
      } else {
        res.status(500).send({
          message: "Error deleting feed item"
        });
      }
    } else res.send(data);
  });
};

// get total likes for feed item
exports.getFeedLikes = (req, res) => {
  Feed.getFeedLikes(req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed likes for this item"
        });
      } else {
        res.status(500).send({
          message: "Error listing feed likes for this item"
        });
      }
    } else res.send(data);
  });
};

// post new gear added to feed
exports.feedPostNewGear = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save feed post in database
  Feed.feedPostNewGear(req.headers.authorization, req.body.id_item_fk, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting to feed."
      });
    else res.send(data);
  });
};

// like feed item
exports.feedLike = (req, res) => {
  Feed.feedLike(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item with this id."
        });
      } else {
        res.status(500).send({
          message: "Error liking feed item."
        });
      }
    } else res.send(data);
  });
};

// unlike feed item
exports.feedUnlike = (req, res) => {
  Feed.feedUnlike(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item"
        });
      } else {
        res.status(500).send({
          message: "Error unlinking feed item."
        });
      }
    } else res.send(data);
  });
};

// get feed comments
exports.feedComments = (req, res) => {
  Feed.feedComments(req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed comments for this post."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed comments for referenced post id"
        });
      }
    } else res.send(data);
  });
};

// new comment
exports.postComment = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save comment in database
  Feed.postComment(req.headers.authorization, req.params.feedId, req.body.text, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting comment."
      });
    else res.send(data);
  });
};

// delete feed comment
exports.deletePostComment = (req, res) => {
  Feed.deletePostComment(req.headers.authorization, req.params.commentId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found comment item"
        });
      } else {
        res.status(500).send({
          message: "Error unlinking comment item."
        });
      }
    } else res.send(data);
  });
};

// get user feed posts
exports.getFeedPosts = (req, res) => {
  Feed.getFeedPosts(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed posts for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed posts for logged user."
        });
      }
    } else res.send(data);
  });
};
