// サイト全体で使う固定情報。ここだけ直せば全ページに反映される。
export const site = {
  name: "Ando",
  brand: "Ando.",
  company: "Logence",
  title: "Ando. | SNS・コンテンツ販売事業の裏方をコードにする開発担当",
  description:
    "LINEの自動応対、入金や契約の管理画面、競合調査や教材の検索基盤。発信者と事務局のうしろで、人がやらなくていい仕事を仕組みにするフリーランス開発者 Ando のポートフォリオ。",
  email: "logence63@gmail.com",
  // 本人確認待ち: 公開してよい X アカウントなら handle を入れる。空なら表示しない。
  x: "",
  // 稼働条件の目安（本人確認待ち。公開前に数字を直す）
  availability: {
    hours: "平日 5〜6 時間（夜間・土日の緊急対応は別途相談）",
    reply: "Slack・LINE・メールは当日中に返信",
    start: "小さな修正は翌営業日から。構築は相談から 1 週間以内に着手",
  },
} as const;

export const mailto = () => {
  const subject = encodeURIComponent("ポートフォリオを見て相談");
  const body = encodeURIComponent(
    "困っていること：\n\n今のやり方（スプレッドシート、Lステップ、手作業など）：\n\n希望時期（未定でも可）：\n"
  );
  return `mailto:${site.email}?subject=${subject}&body=${body}`;
};

// 料金の目安。市場相場（個人への LINE 構築 10〜30 万円）と自分の実績から置いた提案値。
// 本人確認待ち: 公開前に数字を見て直す。
export const pricing = [
  {
    item: "相談・現状の調査",
    price: "初回 60 分 無料",
    note: "今の仕組みと困りごとを聞いて、作る・作らない・直すの判断と見積もりを返します。",
  },
  {
    item: "小さな自動化・修正 1 件",
    price: "3 万〜10 万円",
    note: "CSV の整形、通知の追加、既存システムの不具合修正など。1〜5 日で納品。",
  },
  {
    item: "LINE 自動応対・管理画面の構築",
    price: "30 万円〜",
    note: "設計・実装・試験・公開・引き継ぎ資料まで。期間は 1〜2 か月。お客様のサーバーに置けば月額は増えません。",
  },
  {
    item: "月額の保守・改善",
    price: "3 万円〜 / 月",
    note: "監視・バックアップ・小さな改善を月の時間枠で。止まった時に連絡がつく状態を保ちます。",
  },
  {
    item: "記事・投稿の下書き",
    price: "5,000 円〜 / 本",
    note: "X の長文記事、Threads の投稿など。発信者の過去投稿を読んで文体を合わせ、下書きを納品します。",
  },
] as const;
