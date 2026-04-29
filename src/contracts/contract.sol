// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract dTwitter {

    struct Tweet {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

    uint256 public nextTweetId;

    mapping(uint256 => Tweet) public tweets;

    // user => tweetIds
    mapping(address => uint256[]) public tweetsByUser;

    // tweetId => user => liked or not
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    // user => liked tweetIds
    mapping(address => uint256[]) public likedTweetsByUser;

    event TweetCreated(uint256 id, address indexed author, string content, uint256 timestamp);
    event TweetLiked(uint256 id, address indexed user);

    // Post Tweet
    function postTweet(string memory _content) public {
        require(bytes(_content).length > 0, "Empty tweet");
        require(bytes(_content).length <= 280, "Too long");

        tweets[nextTweetId] = Tweet({
            id: nextTweetId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            likes: 0
        });

        tweetsByUser[msg.sender].push(nextTweetId);

        emit TweetCreated(nextTweetId, msg.sender, _content, block.timestamp);

        nextTweetId++;
    }

    // Like Tweet
    function likeTweet(uint256 _tweetId) public {
        require(_tweetId < nextTweetId, "Tweet not exist");
        require(!hasLiked[_tweetId][msg.sender], "Already liked");

        tweets[_tweetId].likes++;
        hasLiked[_tweetId][msg.sender] = true;

        likedTweetsByUser[msg.sender].push(_tweetId);

        emit TweetLiked(_tweetId, msg.sender);
    }

    // Fetch tweets by author
    function getTweetsByAuthor(address _user) public view returns (Tweet[] memory) {
        uint256[] memory ids = tweetsByUser[_user];
        Tweet[] memory result = new Tweet[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tweets[ids[i]];
        }

        return result;
    }

    // Fetch tweets liked by user
    function getLikedTweets(address _user) public view returns (Tweet[] memory) {
        uint256[] memory ids = likedTweetsByUser[_user];
        Tweet[] memory result = new Tweet[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tweets[ids[i]];
        }

        return result;
    }

    // Get single tweet
    function getTweet(uint256 _id) public view returns (Tweet memory) {
        return tweets[_id];
    }

    // Total tweets
    function getTotalTweets() public view returns (uint256) {
        return nextTweetId;
    }
}