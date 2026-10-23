// 本物の画面が撮れた物。3D のスクリーンに貼る。順番はそのまま空間の並び。
// 依頼主の製品は client: true。公開前に本人が載せる・載せないを決める。
export type Work = {
  id: string;
  title: string;
  what: string;
  tech: string;
  fact: string;
  img: string; // public/work/*.jpg（1600 幅）
  url?: string;
  client?: boolean;
};

export const works: Work[] = [
  { id: "tukihi", title: "個人向け SIM 申込サイト", what: "ブランドの入口から申込、重要事項の同意、本人確認までを一つの体験にした試作。スクロールに連動して SIM カードが 3D で回る。", tech: "HTML / CSS / JavaScript", fact: "申込〜eKYC までの全画面を実装", img: "tukihi.jpg", url: "https://rikimaru63.github.io/Tukihi_HP/" },
  { id: "client-c", title: "軽貨物ドライバー採用サイト", what: "本番稼働中の採用サイト。動く見出しと写真帯、30 秒で終わる応募導線。自社 VPS の Coolify で配信。", tech: "TypeScript / Coolify", fact: "本番稼働中（依頼主の名称は伏せる）", img: "client-c.jpg", client: true },
  { id: "client-a", title: "YouTube 運営を AI が手伝う SaaS", what: "企画・タイトル・サムネイル・台本・分析まで、次にやることを AI が示す。YouTube コンサルの裏方として開発に参加。", tech: "Next.js / Vercel", fact: "依頼主の製品（名称と画面の一部を伏せる）", img: "client-a.jpg", client: true },
  { id: "client-b", title: "YouTube 制作チームの募集サイト", what: "ディレクターから編集者・サムネ・シナリオまで、制作チームと講座生を直接つなぐ。", tech: "Next.js / Vercel", fact: "依頼主の製品（名称と画面の一部を伏せる）", img: "client-b.jpg", client: true },
  { id: "repairdesk", title: "Repair Desk", what: "修理系の動画や記事から商材を拾い、ヤフオクで仕入れて eBay で売るための調査アプリ。ブラウザ連携で定期巡回し、LAN の別端末からも使える。", tech: "Node.js / Orca ブラウザ連携 / SQLite", fact: "自分の道具。常駐で巡回中", img: "repairdesk.jpg" },
  { id: "enoshima", title: "江の島のドッグ＆猫カフェ", what: "店舗サイト。時間帯で営業中の表示が切り替わり、昼の部と夜の部で予約先が変わる。", tech: "HTML / CSS / JavaScript", fact: "公開中", img: "enoshima.jpg", url: "https://rikimaru63.github.io/tsukihi-enoshima/" },
  { id: "tatami", title: "京都の畳店", what: "昭和二十三年創業の畳店のサイト。縦書きと畳の写真だけで組んだ。", tech: "HTML / CSS", fact: "公開中", img: "tatami.jpg", url: "https://rikimaru63.github.io/tatami-hp/" },
  { id: "smartreview", title: "SmartReview AI", what: "評価と使ったサービスを選ぶと、AI が口コミの下書きを作る。API 版と Coolify 版とデモ版。", tech: "Python / PostgreSQL / Coolify", fact: "デモ公開中", img: "smartreview.jpg", url: "https://rikimaru63.github.io/smartreview-demo/" },
  { id: "cafe", title: "カフェの作例", what: "架空のカフェ。写真中心でメニューと店舗情報へつなぐ。", tech: "HTML / CSS", fact: "作例", img: "demo_cafe.jpg", url: "https://rikimaru63.github.io/portfolio/demo/cafe/" },
  { id: "gym", title: "パーソナルジムの作例", what: "架空のジム。悩み、料金、よくある質問、相談の予約まで。", tech: "HTML / CSS / JavaScript", fact: "作例", img: "demo_gym.jpg", url: "https://rikimaru63.github.io/portfolio/demo/gym/" },
  { id: "seitai", title: "整体院の作例", what: "架空の整体院。安心感を軸に施術と院内とアクセス。", tech: "HTML / CSS", fact: "作例", img: "demo_seitai.jpg", url: "https://rikimaru63.github.io/portfolio/demo/seitai/" },
];

// 画面を出せない物（守秘、または端末の中）。文と数字で見せる。
export const more = [
  { title: "LINE 自動応対", what: "複数の LINE 公式アカウント。AI は問い合わせの種類を判定して承認済みの定型文を選ぶだけ。選べない物は Discord と管理画面で人へ。影運用モードで本番前に確かめた。", tech: "TypeScript / Redis / OpenAI / Docker", fact: "自動テスト 3,104 件 · 本番運用中", href: "line-auto-reply" },
  { title: "海外向けトレカ EC", what: "US と EU の本番を自社 VPS の Coolify で運用。価格・画像・購入上限を管理画面から一括更新。営業しながら 11 か月改修。", tech: "Next.js / Prisma / PostgreSQL", fact: "コミット 657 · 自動テスト 1,063 件", href: "trading-card-ec" },
  { title: "入金・契約の管理画面", what: "運用代行の月額入金を会社別に見える化し、Chatwork へ通知。依頼主のサーバーに置いた。", tech: "Next.js / Prisma / Coolify", fact: "自動テスト 826 件 · 本番 11 アカウント", href: "payment-tracker" },
  { title: "SNS 教材 2,848 本の知識基盤", what: "動画・PDF・会員サイトの教材を 1 本 1 ノートに変換し、媒体とジャンルの札で AI が引ける形に。競合 278 アカウント 2,856 投稿も収集して分類。", tech: "Python / NotebookLM / Obsidian", fact: "概念 9,000 以上 · 週次で自動更新", href: "sns-knowledge-base" },
  { title: "SNS の自動マーケター（ShadowAI）", what: "Threads と X の投稿・反応・調査・品質ゲートを AI が回す。OpenClaw のスキル 10 本。", tech: "Python", fact: "コミット 2,335（v1＋v2）" },
  { title: "X の反応者を集めて DM する常駐ツール", what: "指定ポストに反応した人を集め、フォローと いいね、フォロバ確認、お礼の DM まで VPS で回す。3 段の安全モード。", tech: "Python / SQLite / VPS", fact: "コミット 102" },
  { title: "AI 育苗システム", what: "太陽光 450W と LiFePO4 で動く Raspberry Pi 5 と ESP32 の自動潅水・環境監視。電子工作が初めての人が組める A4 106 ページの組み立てマニュアル。", tech: "Raspberry Pi / ESP32 / Python", fact: "マニュアル第 4 版 · 部品総表つき" },
  { title: "2D アクションゲーム 2 本", what: "企画、調査、要件、エンジン選定、GDD、試作と、正式な工程を一段ずつ踏んだ新規開発。Godot 4 で M0 完了。", tech: "Godot 4 / GDScript", fact: "コミット 216" },
  { title: "YouTube 制作の道具 4 本", what: "朗読台本の生成（93 万再生の台本を元に）、デスクトップの制作アプリ（VOICEVOX 同梱）、企画から評価までの流れ、アニメ素材の構成。", tech: "TypeScript / Python / Claude API", fact: "コミット 500 以上" },
  { title: "女性向け SNS 運用スクールの HP", what: "Next.js と Strapi CMS。Docker で自社 VPS に配置。", tech: "Next.js / Strapi / PostgreSQL", fact: "コミット 84", client: true },
];
