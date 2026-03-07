/**
 * @jest-environment node
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Project Configuration', () => {
  describe('TypeScript Configuration', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

    it('should have strict mode enabled in tsconfig', () => {
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('should have path aliases configured', () => {
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./*']);
    });

    it('should target ES2017 or higher', () => {
      const target = tsconfig.compilerOptions.target;
      expect(target === 'ES2017' || target === 'ES2020' || target === 'ES2022' || target === 'ESNext').toBe(true);
    });
  });

  describe('Package.json Configuration', () => {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    it('should have required scripts', () => {
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
    });

    it('should use Next.js 15+', () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^1[456]/);
    });

    it('should use React 19+', () => {
      const reactVersion = packageJson.dependencies.react;
      expect(reactVersion).toMatch(/^19/);
    });

    it('should have TypeScript as dev dependency', () => {
      expect(packageJson.devDependencies.typescript).toBeDefined();
    });
  });

  describe('Next.js Configuration', () => {
    it('should have next.config.ts file', () => {
      const configPath = join(process.cwd(), 'next.config.ts');
      expect(() => readFileSync(configPath, 'utf-8')).not.toThrow();
    });

    it('should have .env.example file', () => {
      const envPath = join(process.cwd(), '.env.example');
      expect(() => readFileSync(envPath, 'utf-8')).not.toThrow();
    });
  });
});
