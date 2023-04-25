import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';

const dataModels = [
  {
    name: 'Unique Hash',
    fields: {
      string1: { label: 'String 1', type: 'string', readOnly: false, calculate: null },
      string2: { label: 'String 2', type: 'string', readOnly: false, calculate: null },
      hash: { label: 'Hash', type: 'string', readOnly: true, calculate: 'uniqueHash' },
    },
  },
  {
    name: 'Statistics',
    fields: {
      ...[...Array(10)].reduce(
        (fields, _, i) => ({ ...fields, [`num${i + 1}`]: { label: `Num ${i + 1}`, type: 'number', readOnly: false, calculate: null } }),
        {}
      ),
      mean: { label: 'Mean', type: 'number', readOnly: true, calculate: 'mean' },
      median: { label: 'Median', type: 'number', readOnly: true, calculate: 'median' },
      stdDev: { label: 'Standard Deviation', type: 'number', readOnly: true, calculate: 'stdDev' },
    },
  },
];

function calculateValue(field, values) {
  switch (field.calculate) {
    case 'uniqueHash':
      const string1 = values.string1 || '';
      const string2 = values.string2 || '';
      return CryptoJS.SHA256(string1 + '\0' + string2).toString();
    case 'mean':
      const sum = Object.values(values).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      return sum / 10;
    case 'median':
      const sortedValues = Object.values(values).sort((a, b) => parseFloat(a) - parseFloat(b));
      return (parseFloat(sortedValues[4]) + parseFloat(sortedValues[5])) / 2;
    case 'stdDev':
      const mean = calculateValue(dataModels[1].fields.mean, values);
      const variance = Object.values(values).reduce((variance, value) => variance + Math.pow((parseFloat(value) || 0) - mean, 2), 0) / 10;
      return Math.sqrt(variance);
    default:
      return null;
  }
}

function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues({});
  }, [selectedModel]);

  const handleChange = (e, key) => {
    setValues({ ...values, [key]: e.target.value });
  };

  return (
    <div className="App">
      <h1>Dynamic Data Model</h1>
      <select
        value={selectedModel ? selectedModel.name : ''}
        onChange={(e) => setSelectedModel(dataModels.find((model) => model.name === e.target.value))}
      >
        <option value="">Select a data model...</option>
        {dataModels.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
      {selectedModel && (
        <div className="model-fields">
          {Object.entries(selectedModel.fields).map(([key, field]) => (
            <div key={key}>
              <label>
                {field.label}:
                <input
                  type={field.type}
                  readOnly={field.readOnly}
                  value={field.readOnly ? calculateValue(field, values) : values[key] || ''}
                  onChange={(e) => handleChange(e, key)}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;