import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('transforms data correctly', async () => {
  const { container } = render(<App />);

  // Mock file upload
  const fileContent = '[{"user_id": "engineer.nagatech"}, {"user_id": "qa.nagatech"}]';
  const file = new File([fileContent], 'data.json', { type: 'application/json' });
  const fileInput = screen.getByLabelText('Choose file');
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Wait for the file to be processed
  await screen.findByText('Transform');

  // Select the 'user_id' property
  const selectElement = await screen.findByRole('combobox');
  fireEvent.mouseDown(selectElement);
  const options = screen.getAllByText('user_id');
  fireEvent.click(options[0]);

  // Transform the data
  const transformButton = screen.getByText('Transform');
  fireEvent.click(transformButton);

  // Check the output
  await screen.findByText('{"$in":["engineer.nagatech","qa.nagatech"]}');
});

test('renders without crashing', () => {
  render(<App />);
});
