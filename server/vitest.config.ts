import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ptt/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '../../rooms/roomManager': path.resolve(__dirname, 'src/rooms/roomManager.ts'),
      '../../game/gameEngine': path.resolve(__dirname, 'src/game/gameEngine.ts'),
    },
    extensions: ['.ts', '.js'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});


