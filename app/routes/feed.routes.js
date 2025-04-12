module.exports = app => {
  const feed = require("../controllers/feed.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve feed
  app.get("/feed", checkToken, feed.feed);

  // Retrieve simple feed (only users posts)
  app.get("/simpleFeed", checkToken, feed.simpleFeed);

  // New Post
  app.post("/feed/newPost", checkToken, feed.newPost);

  // Delete feed item
  app.delete("/feed/:feedId/deleteFeedItem", checkToken, feed.deleteFeedItem);

  // Retrieve feed item likes
  app.get("/:feedId/feedLikes", checkToken, feed.getFeedLikes);

  // Post new gear added to feed
  app.post("/feed/newFeedPostGear", checkToken, feed.feedPostNewGear);

  // Like feed item
  app.post("/feed/:feedId/like", checkToken, feed.feedLike);

  // Unlike feed item
  app.delete("/feed/:feedId/unlike", checkToken, feed.feedUnlike);

  // Retrieve feed comments
  app.get("/feed/:feedId/feedComments", checkToken, feed.feedComments);

  // Post feed comment
  app.post("/feed/:feedId/postComment", checkToken, feed.postComment);

  // Delete feed comment
  app.delete("/feed/:commentId/deletePostComment", checkToken, feed.deletePostComment);

  // Retrieve feed posts
  app.get("/feedPosts", checkToken, feed.getFeedPosts);
};
