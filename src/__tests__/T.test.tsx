import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import I18n from '../I18n';
import T from '../T';

describe('T Component', () => {
  const originalConsoleError = console.error;

  let consoleOutput: string[] = [];
  beforeEach(() => {
    console.error = (...args: string[]): void => {
      args.forEach(arg => consoleOutput.push(arg));
    };
  });

  afterEach(() => {
    consoleOutput = [];
    console.error = originalConsoleError;
  });

  describe('when context is not provided', () => {
    it('should render the key and emit a warning', () => {
      const { getByText } = render(<T phrase="phrase" />);
      expect(getByText('phrase')).toBeInTheDocument();
      expect(consoleOutput).toHaveLength(1);
      expect(consoleOutput[0]).toBe(
        'Warning: t is called without Polyglot context. Perhaps you need to wrap the component in <I18n>?'
      );
    });
  });

  describe('when context is provided', () => {
    describe('when a phrase is not found', () => {
      it('should render the key and emit a warning', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Message' }}>
            <T phrase="unavailable" />
          </I18n>
        );
        const { getByText, queryByText } = render(tree);
        expect(queryByText('phrase')).not.toBeInTheDocument();
        expect(queryByText('Message')).not.toBeInTheDocument();
        expect(getByText('unavailable')).toBeInTheDocument();
        expect(consoleOutput).toHaveLength(1);
        expect(consoleOutput[0]).toBe(
          'Warning: Missing translation for key: "unavailable"'
        );
      });

      it('should render the fallback without warning', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Message' }}>
            <T phrase="unavailable" fallback="Fallback" />
          </I18n>
        );
        const { getByText, queryByText } = render(tree);
        expect(queryByText('phrase')).not.toBeInTheDocument();
        expect(queryByText('Message')).not.toBeInTheDocument();
        expect(getByText('Fallback')).toBeInTheDocument();
        expect(consoleOutput).toHaveLength(0);
      });

      it('should interpolate values to a fallback', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Interpolated: %{message}' }}>
            <T
              phrase="unavailable"
              fallback="Fallback: %{message}"
              interpolations={{ message: 'Success!' }}
            />
          </I18n>
        );
        const { getByText, queryByText } = render(tree);
        expect(queryByText(/^Interpolated: /)).not.toBeInTheDocument();
        expect(getByText(/^Fallback: /)).toBeInTheDocument();
        expect(getByText(/^Fallback: /).textContent).toBe('Fallback: Success!');
      });

      it('should not interpolate values without a fallback', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Interpolated: %{message}' }}>
            <T phrase="unavailable" interpolations={{ message: 'Success!' }} />
          </I18n>
        );
        const { getByText, queryByText } = render(tree);
        expect(queryByText(/^Interpolated: /)).not.toBeInTheDocument();
        expect(queryByText(/Success!/)).not.toBeInTheDocument();
        expect(getByText('unavailable')).toBeInTheDocument();
        expect(getByText('unavailable').textContent).toBe('unavailable');
      });
    });

    describe('when a phrase is found', () => {
      it('should render without warning', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Message' }}>
            <T phrase="phrase" />
          </I18n>
        );
        const { getByText } = render(tree);
        expect(getByText('Message')).toBeInTheDocument();
        expect(consoleOutput).toHaveLength(0);
      });

      it('should render the phrase even a fallback is provided', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Message' }}>
            <T phrase="phrase" fallback="Fallback" />
          </I18n>
        );
        const { getByText, queryByText } = render(tree);
        expect(queryByText('phrase')).not.toBeInTheDocument();
        expect(queryByText('Fallback')).not.toBeInTheDocument();
        expect(getByText('Message')).toBeInTheDocument();
      });

      it('should interpolate values', () => {
        const tree = (
          <I18n locale="en" phrases={{ phrase: 'Interpolated: %{message}' }}>
            <T phrase="phrase" interpolations={{ message: 'Success!' }} />
          </I18n>
        );
        const { getByText } = render(tree);
        expect(getByText(/^Interpolated: /)).toBeInTheDocument();
        expect(getByText(/^Interpolated: /).textContent).toBe(
          'Interpolated: Success!'
        );
      });
    });
  });
});