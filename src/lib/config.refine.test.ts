jest.mock('@/lib/db', () => ({ db: {} }));

import type { AdminConfig } from './admin.types';
import { configSelfCheck, refineConfig } from './config';

const configFile = JSON.stringify({
  api_site: {
    keep: {
      name: '保留源',
      api: 'https://keep.example/api',
    },
    deleted: {
      name: '已删除源',
      api: 'https://deleted.example/api',
    },
  },
});

function makeConfig(overrides: Partial<AdminConfig>): AdminConfig {
  return {
    ConfigFile: '',
    SiteConfig: {} as AdminConfig['SiteConfig'],
    UserConfig: { Users: [] },
    SourceConfig: [],
    CustomCategories: [],
    ...overrides,
  } as AdminConfig;
}

describe('配置文件源删除标记', () => {
  it('合并配置文件时不会重新加入已删除的源', () => {
    const config = refineConfig(
      makeConfig({
        ConfigFile: configFile,
        DeletedSourceKeys: ['deleted'],
      })
    );

    expect(config.SourceConfig.map((source) => source.key)).toEqual(['keep']);
    expect(config.DeletedSourceKeys).toEqual(['deleted']);
  });

  it('配置自检会过滤掉已标记删除的历史源', () => {
    const config = configSelfCheck(
      makeConfig({
        DeletedSourceKeys: ['deleted'],
        SourceConfig: [
          {
            key: 'deleted',
            name: '已删除源',
            api: 'https://deleted.example/api',
            from: 'config',
          },
        ],
      })
    );

    expect(config.SourceConfig).toEqual([]);
  });
});
