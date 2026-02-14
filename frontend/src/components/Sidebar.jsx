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
  const [availableModels, setAvailableModels] = useState([]); // [{id, name}]
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
      setAvailableModels(cfg.available_models); // [{id, name}, ...]
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

  const toggleModel = async (modelId) => {
    let updated;
    if (councilModels.includes(modelId)) {
      updated = councilModels.filter((m) => m !== modelId);
    } else {
      updated = [...councilModels, modelId];
    }
    if (updated.length === 0) return;
    setCouncilModels(updated);
    try {
      await api.updateConfig(updated, chairmanModel);
    } catch (e) {
      console.error('Failed to update config:', e);
    }
  };

  const setChair = async (modelId) => {
    setChairmanModel(modelId);
    // Also add to council if not already there
    let updated = councilModels;
    if (!councilModels.includes(modelId)) {
      updated = [...councilModels, modelId];
      setCouncilModels(updated);
    }
    try {
      await api.updateConfig(updated, modelId);
    } catch (e) {
      console.error('Failed to set chairman:', e);
    }
  };

  const displayName = (model) => {
    // model is {id, name} object or just a string (fallback)
    if (typeof model === 'object') return model.name;
    return model.split('/').pop();
  };

  const modelId = (model) => {
    if (typeof model === 'object') return model.id;
    return model;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <h1>LLM Council</h1>
          {balance !== null && (
            <a
              href="https://openrouter.ai/settings/credits"
              target="_blank"
              rel="noopener noreferrer"
              className="balance-badge"
              title="Click to add credits on OpenRouter"
            >
              ${balance.toFixed(2)}
            </a>
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
          {configOpen ? '▼' : '▶'} Council Members ({councilModels.length})
        </button>
        {configOpen && (
          <div className="config-panel">
            {availableModels.map((model) => {
              const id = modelId(model);
              return (
                <div key={id} className="model-row">
                  <label className="model-checkbox">
                    <input
                      type="checkbox"
                      checked={councilModels.includes(id)}
                      onChange={() => toggleModel(id)}
                    />
                    <span className="model-name" title={id}>{displayName(model)}</span>
                  </label>
                  <button
                    className={`chair-btn ${chairmanModel === id ? 'active' : ''}`}
                    onClick={() => setChair(id)}
                    title="Set as Chairman"
                  >
                    {chairmanModel === id ? '★ Chair' : 'Set Chair'}
                  </button>
                </div>
              );
            })}
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
