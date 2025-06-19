import React from "react";
import { Post } from "../../../core/domain/entities/Post";
import { getImageUrl } from '../../../utils/getImageUrl';


interface FullScreenPostModalProps {
  post: Post;
  onClose: () => void;
}

const FullScreenPostModal: React.FC<FullScreenPostModalProps> = ({ post, onClose }) => {


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Post by {post.profile.username}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="flex flex-col space-y-4">
          {post.content && <p>{post.content}</p>}
          {post.image && (
            <img
              src={getImageUrl(post.image)}
              alt="Post"
              className="w-full h-auto rounded"
            />
          )}
          <div className="flex space-x-4">
            <button className="flex items-center">
              <span>👍</span>
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center">
              <span>💬</span>
              <span>{post.comments.length} comments</span>
            </button>
          </div>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Comments</h3>
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-center space-x-2 mb-2">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${comment.profile.profile_picture}`}
                  alt={comment.profile.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-bold">{comment.profile.username}</span>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPostModal;