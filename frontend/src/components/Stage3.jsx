import ReactMarkdown from 'react-markdown';
import './Stage3.css';

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  const handleShareAnswer = () => {
    const text = finalResponse.response;
    navigator.clipboard.writeText(text).then(() => {
      alert('Final answer copied to clipboard!');
    }).catch(() => {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<pre>${text.replace(/</g, '&lt;')}</pre>`);
      }
    });
  };

  return (
    <div className="stage stage3">
      <h3 className="stage-title">Stage 3: Final Council Answer</h3>
      <div className="final-response">
        <div className="final-response-header">
          <div className="chairman-label">
            Chairman: {finalResponse.model.split('/')[1] || finalResponse.model}
          </div>
          <button className="share-answer-btn" onClick={handleShareAnswer} title="Copy answer to clipboard">
            Share
          </button>
        </div>
        <div className="final-text markdown-content">
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
