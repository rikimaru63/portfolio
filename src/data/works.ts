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
  { id: "tukihi", title: "個人向け SIM 申込サイト", what: "個人向け SIM のブランドサイトから申込、重要事項への同意、本人確認までを一つの流れにした試作です。スクロールすると SIM カードが 3D で回ります。依頼ではなく、提案のために自分で作りました。", tech: "HTML / CSS / JavaScript", fact: "申込から eKYC までの全画面を実装", img: "tukihi.jpg", url: "https://rikimaru63.github.io/Tukihi_HP/" },
  { id: "client-c", title: "軽貨物ドライバー採用サイト", what: "本番で動いている採用サイトです。見出しが動き、写真が帯で流れ、応募は 30 秒で終わるようにしました。自社の VPS に置いた Coolify で配信しています。", tech: "TypeScript / Coolify", fact: "本番稼働中。依頼主の名前は伏せています", img: "client-c.jpg", client: true },
  { id: "repairdesk", title: "Repair Desk", what: "修理系の動画や記事から商材を拾い、ヤフオクで仕入れて eBay で売るための調査アプリです。自分用に作りました。ブラウザと連携して定期的に巡回し、同じ Wi-Fi の別の端末からも開けます。", tech: "Node.js / Orca ブラウザ連携 / SQLite", fact: "自分の道具。常駐で巡回中", img: "repairdesk.jpg" },
  { id: "enoshima", title: "江の島のドッグ＆猫カフェ", what: "江の島の店舗サイトです。時間帯で営業中の表示が切り替わり、昼の部と夜の部で予約先が変わります。", tech: "HTML / CSS / JavaScript", fact: "公開中", img: "enoshima.jpg", url: "https://rikimaru63.github.io/tsukihi-enoshima/" },
  { id: "tatami", title: "京都の畳店", what: "昭和二十三年創業の畳店のサイトです。縦書きの文字と畳の写真だけで組みました。", tech: "HTML / CSS", fact: "公開中", img: "tatami.jpg", url: "https://rikimaru63.github.io/tatami-hp/" },
  { id: "smartreview", title: "SmartReview AI", what: "評価と使ったサービスを選ぶと、AI が口コミの下書きを作ります。API 版、Coolify 版、デモ版の 3 つを作りました。", tech: "Python / PostgreSQL / Coolify", fact: "デモ公開中", img: "smartreview.jpg", url: "https://rikimaru63.github.io/smartreview-demo/" },
  { id: "cafe", title: "カフェの作例", what: "架空のカフェで作った構成の例です。写真を中心に、メニューと店舗情報へつなぎます。", tech: "HTML / CSS", fact: "作例", img: "demo_cafe.jpg", url: "https://rikimaru63.github.io/portfolio/demo/cafe/" },
  { id: "gym", title: "パーソナルジムの作例", what: "架空のジムで作った構成の例です。悩み、料金、よくある質問、相談の予約までを一本の流れにしています。", tech: "HTML / CSS / JavaScript", fact: "作例", img: "demo_gym.jpg", url: "https://rikimaru63.github.io/portfolio/demo/gym/" },
  { id: "seitai", title: "整体院の作例", what: "架空の整体院で作った構成の例です。安心感を軸に、施術と院内とアクセスを見せます。", tech: "HTML / CSS", fact: "作例", img: "demo_seitai.jpg", url: "https://rikimaru63.github.io/portfolio/demo/seitai/" },
];

// 画面を出せない物（守秘、または端末の中）。文と数字で見せる。
export const more = [
  { title: "LINE 自動応対", what: "複数の LINE 公式アカウントの返信を自動化しました。AI がやるのは問い合わせの種類を判定して、依頼主が承認した定型文を選ぶところまでです。選べない時は何も返さず、Discord と管理画面で人に回します。本番に出す前に、判定だけして送らない影運用で確かめました。", tech: "TypeScript / Redis / OpenAI / Docker", fact: "自動テスト 3,104 件 · 本番運用中", href: "line-auto-reply" },
  { title: "YouTube 運営を手伝う AI の SaaS", what: "企画、タイトル、サムネイル、台本、分析まで、次に何をすればいいかを AI が示す SaaS です。YouTube コンサルの裏方チームの一員として、Next.js で開発に加わっています。製品名は伏せています。", tech: "Next.js / Vercel", fact: "依頼主の製品 · 稼働中", client: true },
  { title: "YouTube 制作チームの募集サイト", what: "ディレクター、編集者、サムネイル、シナリオまで、制作チームと講座生を直接つなぐサイトです。上と同じ裏方チームで作りました。", tech: "Next.js / Vercel", fact: "依頼主の製品 · 稼働中", client: true },
  { title: "海外向けトレカ EC", what: "海外向けのトレーディングカード EC を、US と EU の本番として自社 VPS の Coolify で運用しています。価格、画像、購入上限を管理画面から一括で更新できるようにしました。営業を止めずに 11 か月改修を続けています。", tech: "Next.js / Prisma / PostgreSQL", fact: "コミット 657 · 自動テスト 1,063 件", href: "trading-card-ec" },
  { title: "入金・契約の管理画面", what: "運用代行の月額入金を会社ごとに見える化し、Chatwork に通知する管理画面です。依頼主のサーバーに置きました。", tech: "Next.js / Prisma / Coolify", fact: "自動テスト 826 件 · 本番 11 アカウント", href: "payment-tracker" },
  { title: "SNS 教材 2,848 本の知識基盤", what: "動画、PDF、会員サイトにあった SNS 教材 2,848 本を、1 本 1 ノートに変換しました。媒体とジャンルの札を付けて AI が引けるようにし、競合 278 アカウントの 2,856 投稿も集めて分類しています。", tech: "Python / NotebookLM / Obsidian", fact: "概念 9,000 以上 · 週次で自動更新", href: "sns-knowledge-base" },
  { title: "SNS の自動マーケター（ShadowAI）", what: "Threads と X の投稿、反応、調査、品質の検査を AI が回す仕組みです。OpenClaw のスキルを 10 本書きました。v1 と v2 で 2,335 コミットあり、私のリポジトリで一番大きい物です。", tech: "Python", fact: "コミット 2,335（v1＋v2）" },
  { title: "X の反応者を集めて DM する常駐ツール", what: "指定したポストに反応した人を集め、フォローといいね、フォロー返しの確認、お礼の DM までを VPS で回します。本当に送るまでに 3 段階の安全モードを置きました。", tech: "Python / SQLite / VPS", fact: "コミット 102" },
  { title: "AI 育苗システム", what: "太陽光 450W と LiFePO4 で動く、Raspberry Pi 5 と ESP32 の自動潅水と環境監視です。電子工作が初めての人が室内で組んで現地へ運べるように、A4 で 106 ページの組み立てマニュアルを書きました。", tech: "Raspberry Pi / ESP32 / Python", fact: "マニュアル第 4 版 · 部品総表つき" },
  { title: "2D アクションゲーム 2 本", what: "企画から調査、要件、エンジン選定、GDD、試作まで、正式な工程を一段ずつ踏んで進めています。Godot 4 で最初の試作が動いています。", tech: "Godot 4 / GDScript", fact: "コミット 216" },
  { title: "YouTube 制作の道具 4 本", what: "朗読台本の生成（93 万再生の台本を元にしています）、VOICEVOX を同梱したデスクトップの制作アプリ、企画から評価までの流れ、アニメ素材の構成の 4 本です。", tech: "TypeScript / Python / Claude API", fact: "コミット 500 以上" },
  { title: "女性向け SNS 運用スクールの HP", what: "女性向け SNS 運用スクールのサイトです。Next.js と Strapi で作り、Docker で自社 VPS に置きました。", tech: "Next.js / Strapi / PostgreSQL", fact: "コミット 84", client: true },
];
