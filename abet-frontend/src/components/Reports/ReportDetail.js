const [comment, setComment] = useState('');
const [comments, setComments] = useState([]);

const postComment = async () => {
  await axios.post(`http://localhost:8000/api/reports/${reportId}/comments/`, 
    { text: comment },
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
        'Content-Type': 'application/json'
      }
    }
  );
  setComment('');
  // Optionally re-fetch comments here
};

return (
<div className="comments-section">
  <h4>Comments</h4>
  {comments.map((c, index) => (
    <p key={index}><strong>{c.user}</strong>: {c.text}</p>
  ))}
  <textarea
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Write a comment..."
  />
  <button onClick={postComment}>Post Comment</button>
</div>
)