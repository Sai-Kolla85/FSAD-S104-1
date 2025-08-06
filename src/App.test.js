import { render, screen } from '@testing-library/react';
import Card from './components/Card';

test('renders card component', () => {
  render(<Card title="Test Card">Test Content</Card>);
  const titleElement = screen.getByText(/Test Card/i);
  expect(titleElement).toBeInTheDocument();
});
