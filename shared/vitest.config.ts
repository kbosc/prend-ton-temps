import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '../../logic/victoryValidator': path.resolve(__dirname, 'src/logic/victoryValidator.ts'),
      '../../logic/conditionPool': path.resolve(__dirname, 'src/logic/conditionPool.ts'),
      '../../types/gameState': path.resolve(__dirname, 'src/types/gameState.ts'),
      '../../types/clockFace': path.resolve(__dirname, 'src/types/clockFace.ts'),
      '../../types/card': path.resolve(__dirname, 'src/types/card.ts'),
      '../../types/condition': path.resolve(__dirname, 'src/types/condition.ts'),
    },
    extensions: ['.ts', '.js'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});



