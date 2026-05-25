# 3次元地図可視化サイト

国土地理院が提供する3次元地図可視化サイトのソースコードです。

## ⚠️ 公開前の調整事項

以下の設定値は開発・デモ用のURLを指しています。**国土地理院本番環境へ公開する前に、本番URLへの差し替えが必要です。**

### タイルURL変更箇所

**ファイル:** `src/lib/config.ts`

| 設定                                                | 変更前                                                                            | 変更後(地理院ホスト)                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `POINT_CLOUD_CONFIG.TILES_INDEX_URL` (L254)         | `https://d2g57vdz6jjbu8.cloudfront.net/3dtiles.json`                              | `https://cyberjapandata.gsi.go.jp/3dpc-3dtiles/pointcloud/iwaki/the-roof-standard-point/3dtiles.json` |
| `POINT_CLOUD_CONFIG.TILESET_BASE_URL` (L256)        | `https://d2g57vdz6jjbu8.cloudfront.net/3dtiles`                                   | `https://cyberjapandata.gsi.go.jp/3dpc-3dtiles/pointcloud/iwaki`                                      |
| `DENSHI_KOKUDO_3D_CONFIG.RAILS_URL` (L273)          | `https://geolonia.github.io/gsi-3d-2025-demo-3dgeojson/rails.geojson`             | `https://cyberjapandata.gsi.go.jp/3dmaps/rails.geojson`                                               |
| `DENSHI_KOKUDO_3D_CONFIG.ROADS_URL` (L274)          | `https://geolonia.github.io/gsi-3d-2025-demo-3dgeojson/roads.geojson`             | `https://cyberjapandata.gsi.go.jp/3dmaps/roads.geojson`                                               |
| `DENSHI_KOKUDO_3D_CONFIG.BUILDINGS_TILE_URL` (L276) | `https://geolonia.github.io/gsi-3d-2025-demo-3dgeojson/buildings/{z}/{x}/{y}.pbf` | `https://cyberjapandata.gsi.go.jp/3dmaps/buildings/{z}/{x}/{y}.pbf`                                   |

### ヘルプリンク変更箇所

| ファイル                | 箇所                           | 変更前                        | 変更後(Private)                                      |
| ----------------------- | ------------------------------ | ----------------------------- | ---------------------------------------------------- |
| `src/lib/config.ts` L22 | `GENERAL_CONFIG.HELP_PAGE_URL` | `http://maps.gsi.go.jp/help/` | `https://potential-goggles-3qr4o98.pages.github.io/` |

## 概要

地理院地図の地図データや各種タイルを3D表示で閲覧できるWebアプリケーションです。

### 主な機能

- 地図の3D表示（地形の起伏表現、Globe表示）
- 描画・注記（ポイント、ライン、ポリゴン、テキスト）
- 距離・面積の計測
- 点群データの表示（3D Tiles）
- 住所検索（日本語住所ジオコーディング）
- 印刷・画像保存
- URL共有
- 複数地図の並列表示・重ね合わせ

## サイト

- デモ: https://verbose-spoon-2q6zo6r.pages.github.io/
- 地理院地図: https://maps.gsi.go.jp/

## セットアップ

### 必要環境

- Node.js 24.4.1（[Volta](https://volta.sh/) の利用を推奨）
- pnpm 10.13.1

### インストール・起動

```bash
git clone https://github.com/geolonia/gsi-3d-2025.git
cd gsi-3d-2025
pnpm install
pnpm dev
```

ブラウザで http://localhost:3000 を開くと開発版が表示されます。

### ビルド・デプロイ

```bash
pnpm build
```

静的サイトとして `./out` ディレクトリに出力されます。任意のWebサーバに配置してください。

サブディレクトリに配置する場合は `BASE_PATH` 環境変数を指定します。

```bash
BASE_PATH=/gsi-3d-2025 pnpm build
```

GitHub Pagesへのデプロイは `main` ブランチへのプッシュで自動実行されます。

### 開発コマンド一覧

| コマンド      | 説明                                 |
| ------------- | ------------------------------------ |
| `pnpm dev`    | 開発サーバを起動                     |
| `pnpm build`  | 静的サイトをビルド（`./out` に出力） |
| `pnpm start`  | ビルド済みサイトをローカルで配信     |
| `pnpm lint`   | ESLintによるコードチェック           |
| `pnpm fix`    | Prettier・ESLintの自動修正           |
| `pnpm format` | Prettierによるフォーマットチェック   |

## 技術スタック

- [Next.js](https://nextjs.org/) 16（App Router、静的エクスポート）
- [React](https://react.dev/) 19
- [MapLibre GL JS](https://maplibre.org/)
- [TerraDraw](https://terradraw.io/)
- [Deck.gl](https://deck.gl/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/) 4

## 利用上の留意点

- 本リポジトリのソースコードは [BSD-2-Clause ライセンス](./LICENSE)で提供しています。利用される場合はライセンスの条件に従ってください。サードパーティライブラリについては各ライブラリのライセンスに従います。
- 本アプリケーションで利用している[地理院タイル](https://maps.gsi.go.jp/development/ichiran.html)については、[国土地理院の利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html)に従ってご利用ください。
- 住所検索等で利用しているサーバサイド機能は、予告なく仕様変更や提供終了する場合があります。安定した運用が必要な場合は、ご自身の環境で同等の機能を構築することを推奨します。
- プルリクエストを送っていただく場合、その内容は BSD-2-Clause ライセンスに同意したものとして取り扱います。

## 関連リポジトリ

- [gsi-cyberjapan/gsimaps](https://github.com/gsi-cyberjapan/gsimaps) - 地理院地図
- [gsi-cyberjapan/layers-dot-txt-spec](https://github.com/gsi-cyberjapan/layers-dot-txt-spec) - レイヤー定義仕様

## ライセンス

[BSD-2-Clause](./LICENSE)
