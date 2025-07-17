// import React, { useState } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../../../store/hooks';
// import { setBackendModel } from '../../../../../../store/slices/settingsSlice';
// import { OPENAI_MODELS, getModelById, type OpenAIModel } from '../../../types/openAIModels';
// import styles from './ApiConfigSection.module.scss';

// export const ApiConfigSection: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const currentModelId = useAppSelector(state => state.settings.backendModel);
//   const [selectedModel, setSelectedModel] = useState<OpenAIModel>(
//     getModelById(currentModelId) || OPENAI_MODELS[0]
//   );

//   console.log('ApiConfigSection rendering with:', { currentModelId, selectedModel, OPENAI_MODELS });
//   console.log('CSS styles object:', styles);

//   const handleModelSelect = (model: OpenAIModel) => {
//     console.log('Model selected:', model);
//     setSelectedModel(model);
//     dispatch(setBackendModel(model.id));
//   };

//   return (
//     <div className={styles.section}>
//       <h3 className={styles.sectionTitle}>AI Model Selection</h3>
//       <p className={styles.sectionText}>
//         Choose your preferred OpenAI model. All models are powered by our backend service.
//       </p>
      
//       <div className={styles.serviceInfo}>
//         <div className={styles.serviceStatus}>
//           <span className={styles.statusDot}></span>
//           <span>Backend service active</span>
//         </div>
//         <div className={styles.serviceNote}>
//           🔒 No API keys needed - we handle OpenAI securely
//         </div>
//       </div>

//       <div className={styles.modelGrid}>
//         {OPENAI_MODELS.map((model) => (
//           <div
//             key={model.id}
//             className={`${styles.modelCard} ${
//               selectedModel.id === model.id ? styles.selected : ''
//             } ${model.recommended ? styles.recommended : ''}`}
//             onClick={() => handleModelSelect(model)}
//           >
//             <div className={styles.modelHeader}>
//               <div className={styles.modelIcon}>{model.icon}</div>
//               <div className={styles.modelTitle}>
//                 <h4>
//                   {model.name}
//                   {model.recommended && <span className={styles.recommendedBadge}>Recommended</span>}
//                 </h4>
//                 <p>{model.description}</p>
//               </div>
//             </div>

//             <div className={styles.modelMetrics}>
//               <div className={styles.metric}>
//                 <span className={styles.metricLabel}>Speed</span>
//                 <span className={styles.metricValue}>{model.speed}</span>
//               </div>
//               <div className={styles.metric}>
//                 <span className={styles.metricLabel}>Cost</span>
//                 <span className={styles.metricValue}>{model.cost}</span>
//               </div>
//               <div className={styles.metric}>
//                 <span className={styles.metricLabel}>Max Tokens</span>
//                 <span className={styles.metricValue}>
//                   {model.maxTokens.toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             <div className={styles.capabilities}>
//               <span className={styles.capabilitiesLabel}>Best for:</span>
//               <div className={styles.capabilityTags}>
//                 {model.capabilities.map((cap, index) => (
//                   <span key={index} className={styles.capabilityTag}>
//                     {cap}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className={styles.selectedModelInfo}>
//         <h4>Selected: {selectedModel.name}</h4>
//         <p>You're all set! Start chatting with {selectedModel.name}.</p>
//         <div className={styles.modelDetails}>
//           <span>Max tokens: {selectedModel.maxTokens.toLocaleString()}</span>
//           <span>Speed: {selectedModel.speed}</span>
//           <span>Cost: {selectedModel.cost}</span>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState, useRef, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: OpenAIModel) => {
    console.log('Model selected:', model);
    setSelectedModel(model);
    dispatch(setBackendModel(model.id));
    setIsOpen(false);
  };

  const getSpeedClass = (speed: string) => {
    switch (speed) {
      case 'very fast': return 'veryFast';
      case 'fast': return 'fast';
      case 'medium': return 'medium';
      case 'slow': return 'slow';
      default: return '';
    }
  };

  const getCostClass = (cost: string) => {
    switch (cost) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return '';
    }
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

      {/* Model Dropdown */}
      <div className={styles.dropdownContainer} ref={dropdownRef}>
        <label className={styles.dropdownLabel}>
          Select Model
        </label>
        
        {/* Dropdown Button */}
        <button
          className={`${styles.dropdownButton} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.dropdownButtonContent}>
            <span className={styles.dropdownIcon}>{selectedModel.icon}</span>
            <div className={styles.dropdownTitle}>
              <h4>
                {selectedModel.name}
                {selectedModel.recommended && (
                  <span className={styles.recommendedBadge}>Recommended</span>
                )}
              </h4>
              <p>{selectedModel.description}</p>
            </div>
          </div>
          <svg 
            className={`${styles.dropdownChevron} ${isOpen ? styles.rotated : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={styles.dropdownMenu}>
            {OPENAI_MODELS.map((model) => (
              <div
                key={model.id}
                className={`${styles.dropdownOption} ${
                  selectedModel.id === model.id ? styles.selected : ''
                }`}
                onClick={() => handleModelSelect(model)}
              >
                <div className={styles.optionContent}>
                  <span className={styles.optionIcon}>{model.icon}</span>
                  <div className={styles.optionDetails}>
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>{model.name}</span>
                      {model.recommended && (
                        <span className={styles.recommendedBadge}>Recommended</span>
                      )}
                      {selectedModel.id === model.id && (
                        <svg 
                          className={styles.checkIcon}
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className={styles.optionDescription}>
                      {model.description}
                    </div>
                    
                    {/* Model Metrics */}
                    <div className={styles.optionMetrics}>
                      <div className={styles.metricItem}>
                        <svg 
                          className={`${styles.metricIcon} ${styles.speed} ${styles[getSpeedClass(model.speed)]}`}
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span>Speed: </span>
                        <strong className={`${styles.metricValue} ${styles.speed} ${styles[getSpeedClass(model.speed)]}`}>
                          {model.speed}
                        </strong>
                      </div>
                      <div className={styles.metricItem}>
                        <svg 
                          className={`${styles.metricIcon} ${styles.cost} ${styles[getCostClass(model.cost)]}`}
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>Cost: </span>
                        <strong className={`${styles.metricValue} ${styles.cost} ${styles[getCostClass(model.cost)]}`}>
                          {model.cost}
                        </strong>
                      </div>
                      <div className={styles.metricItem}>
                        <span>Tokens: </span>
                        <strong>{model.maxTokens.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className={styles.optionCapabilities}>
                      {model.capabilities.map((cap, index) => (
                        <span key={index} className={styles.capabilityTag}>
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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