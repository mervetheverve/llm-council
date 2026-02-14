import { useState, useEffect } from 'react';
import { api } from '../api';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}) {
  const [balance, setBalance] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [councilModels, setCouncilModels] = useState([]);
  const [chairmanModel, setChairmanModel] = useState('');
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    loadConfig();
    loadBalance();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await api.getConfig();
      setAvailableModels(cfg.available_models);
      setCouncilModels(cfg.council_models);
      setChairmanModel(cfg.chairman_model);
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  };

  const loadBalance = async () => {
    try {
      const data = await api.getBalance();
      if (data.balance !== null) {
        setBalance(data.balance);
      }
    } catch (e) {
      console.error('Failed to load balance:', e);
    }
  };

  const toggleModel = async (model) => {
    let updated;
    if (councilModels.includes(model)) {
      updated = councilModels.filter((m) => m !== model);
    } else {
      updated = [...councilModels, model];
    }
    if (updated.length === 0) return; // must have at least 1
    setCouncilModels(updated);
    // If chairman was removed from council, keep it anyway (chairman can differ)
    try {
      await api.updateConfig(updated, chairmanModel);
    } catch (e) {
      console.error('Failed to update config:', e);
    }
  };

  const setChair = async (model) => {
    setChairmanModel(model);
    try {
      await api.updateConfig(councilModels, model);
    } catch (e) {
      console.error('Failed to set chairman:', e);
    }
  };

  const shortName = (model) => {
    // "openai/gpt-5.2" -> "GPT-5.2"
    const name = model.split('/').pop();
    return name;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <h1>LLM Council</h1>
          {balance !== null && (
            <div className="balance-badge">${balance.toFixed(2)}</div>
          )}
        </div>
        <button className="new-conversation-btn" onClick={onNewConversation}>
          + New Conversation
        </button>
      </div>

      <div className="config-section">
        <button
          className="config-toggle"
          onClick={() => setConfigOpen(!configOpen)}
        >
          {configOpen ? '▼' : '▶'} Council Members
        </button>
        {configOpen && (
          <div className="config-panel">
            {availableModels.map((model) => (
              <div key={model} className="model-row">
                <label className="model-checkbox">
                  <input
                    type="checkbox"
                    checked={councilModels.includes(model)}
                    onChange={() => toggleModel(model)}
                  />
                  <span className="model-name">{shortName(model)}</span>
                </label>
                <button
                  className={`chair-btn ${chairmanModel === model ? 'active' : ''}`}
                  onClick={() => setChair(model)}
                  title="Set as Chairman"
                >
                  {chairmanModel === model ? '★ Chair' : 'Set Chair'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-title">
                {conv.title || 'New Conversation'}
              </div>
              <div className="conversation-meta">
                {conv.message_count} messages
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
