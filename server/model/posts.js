const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/DiscussionForm", {
  useNewUrlParser: true,
});

const postSchema = new mongoose.Schema({
  auther: { type: String },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  title: { type: String },
  content: { type: String },
  likes: { type: Number },
  autherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  comments: [
    {
      autherId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      profilePicture: {
        data: Buffer,
        contentType: String,
      },
      auther: { type: String },
      text: { type: String },
      onComments: [
        {
          autherId: {
            type: mongoose.Schema.Types.ObjectId,
          },
          profilePicture: {
            data: Buffer,
            contentType: String,
          },
          auther: { type: String },
          text: { type: String },
        },
      ],
    },
  ],
});

const post = mongoose.model("post", postSchema);

module.exports = post;
