import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store/hooks';
import { setBackendModel } from '../../../../../../store/slices/settingsSlice';
import { OPENAI_MODELS, getModelById, type OpenAIModel } from '../../../types/openAIModels';
import styles from './ApiConfigSection.module.scss';

export const ApiConfigSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentModelId = useAppSelector(state => state.settings.backendModel);
  const [selectedModel, setSelectedModel] = useState<OpenAIModel>(
    getModelById(currentModelId) || OPENAI_MODELS[0]
  );

  console.log('ApiConfigSection rendering with:', { currentModelId, selectedModel, OPENAI_MODELS });
  console.log('CSS styles object:', styles);

  const handleModelSelect = (model: OpenAIModel) => {
    console.log('Model selected:', model);
    setSelectedModel(model);
    dispatch(setBackendModel(model.id));
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>AI Model Selection</h3>
      <p className={styles.sectionText}>
        Choose your preferred OpenAI model. All models are powered by our backend service.
      </p>
      
      <div className={styles.serviceInfo}>
        <div className={styles.serviceStatus}>
          <span className={styles.statusDot}></span>
          <span>Backend service active</span>
        </div>
        <div className={styles.serviceNote}>
          🔒 No API keys needed - we handle OpenAI securely
        </div>
      </div>

      <div className={styles.modelGrid}>
        {OPENAI_MODELS.map((model) => (
          <div
            key={model.id}
            className={`${styles.modelCard} ${
              selectedModel.id === model.id ? styles.selected : ''
            } ${model.recommended ? styles.recommended : ''}`}
            onClick={() => handleModelSelect(model)}
          >
            <div className={styles.modelHeader}>
              <div className={styles.modelIcon}>{model.icon}</div>
              <div className={styles.modelTitle}>
                <h4>
                  {model.name}
                  {model.recommended && <span className={styles.recommendedBadge}>Recommended</span>}
                </h4>
                <p>{model.description}</p>
              </div>
            </div>

            <div className={styles.modelMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Speed</span>
                <span className={styles.metricValue}>{model.speed}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Cost</span>
                <span className={styles.metricValue}>{model.cost}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Max Tokens</span>
                <span className={styles.metricValue}>
                  {model.maxTokens.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.capabilities}>
              <span className={styles.capabilitiesLabel}>Best for:</span>
              <div className={styles.capabilityTags}>
                {model.capabilities.map((cap, index) => (
                  <span key={index} className={styles.capabilityTag}>
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.selectedModelInfo}>
        <h4>Selected: {selectedModel.name}</h4>
        <p>You're all set! Start chatting with {selectedModel.name}.</p>
        <div className={styles.modelDetails}>
          <span>Max tokens: {selectedModel.maxTokens.toLocaleString()}</span>
          <span>Speed: {selectedModel.speed}</span>
          <span>Cost: {selectedModel.cost}</span>
        </div>
      </div>
    </div>
  );
};
