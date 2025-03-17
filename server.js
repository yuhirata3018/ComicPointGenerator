const express = require('express');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const app = express();
const port = 3000;

// JSONボディ解析ミドルウェアの設定
app.use(express.json());

// 静的ファイルの配信
app.use(express.static(path.join(__dirname)));

// ルート("/")にアクセスされた場合は index.html を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 各評価項目ごとのキーワード定義
const categories = {
  'ストーリー': {
    positive: ['面白い', '感動的', 'ヤバい', '奥深い', '引き込まれる', '泣ける', '熱い','衝撃','感動','エグい','痛い','燃える','神漫画','最高','すごい','天才','最高','神マンガ','伏線','展開',],
    negative: ['つまらない', '退屈', 'くだらない','しょうもない','駄目','ありきたり','二番煎じ','良くない','パクリ','似たり寄ったり','カス','クソ','ゴミ','クソ漫画','面白くない','嫌い','嫌','不快','不愉快','不愉快','不快','素人レベル','単調','未回収',]
  },
  'キャラクター': {
    positive: ['魅力的', '個性的', 'かっこいい', 'かわいい','可愛い','美少女','美少年','美形','美人','美男','美しい','美麗','美','カッコいい','カワイイ'
,'カッコいい','カワイイ','最高','神','すごい','推し','推せる','推しキャラ','最高'],
    negative: ['陳腐', '平凡', '薄い','キャラが立ってない','パクリ','似たり寄ったり','つまらない','退屈','くだらない','駄目','ありきたり','二番煎じ','良くない','ゴミ','面白くない','嫌い','嫌','不快','不愉快','不愉快','不快','不']
  },
  '読みやすさ': {
    positive: ['読みやすい', '分かりやすい', 'スムーズ', 'テンポが良い', 'わかりやすい','読める','良い','わかりみ','スキル','サクサク読める'],
    negative: ['読みにくい', '複雑', '難解','わかりにくい','読めない','わからない','読む人を選ぶ','理解不能','理解できない','意味不明','はてな','わからん']
  },
  '絵の上手さ': {
    positive: ['絵がうまい', '美しい', '上手い', '画力','天才','描き込み','線画','色使い','表現力','技術','技術力','変態','神','最高','すごい','作画','イかれてる','エグい'],
    negative: ['下手', '雑', '絵が下手','素人','未熟','読みにくい','わからない','読めない','理解できない','理解しずらい','何が起きてる','技術が無い','アシスタント']
  },
  'センス': {
    positive: ['センス', 'おしゃれ', '神','センスしかない','天才','最高','すごい','センスがいい','洒落','センスがある','センスが抜群','すごい','エグい','イカれてる','狂ってる','異常','センスが異次元','異次元のセンス','異次元'],
    negative: ['センスない', 'ダサい', '古い','萎える','つまらない','退屈','くだらない','駄目','ありきたり','二番煎じ','良くない','パクリ','似たり寄ったり','カス','クソ','ゴミ','クソ漫画','面白くない','嫌い','不快','不愉快','不愉快','不快','センスねぇ']
  }
};

// Twitter APIクライアントの初期化（環境変数 BEARER_TOKEN を使用）
const twitterClient = new TwitterApi(process.env.BEARER_TOKEN);

// /search エンドポイントの定義
app.post('/search', async (req, res) => {
  console.log("POST /search リクエスト受信:", req.body);
  try {
    const title = req.body.title;
    if (!title || typeof title !== 'string' || title.trim() === "") {
      return res.status(400).json({ error: "タイトルが指定されていません" });
    }

    // Twitter APIで漫画タイトルに関連するツイートを検索（日本語、リツイート除外）
    const query = `"${title}" lang:ja -is:retweet`;
    const tweetsResponse = await twitterClient.v2.search(query, { max_results: 50 });

    // カテゴリ別のカウント初期化
    const categoryCounts = {};
    for (const cat in categories) {
      categoryCounts[cat] = { positive: 0, negative: 0 };
    }
    let tweetCount = 0;

    // ツイート本文をループし、各カテゴリごとにキーワードカウントを実施
    for await (const tweet of tweetsResponse) {
      tweetCount++;
      const text = tweet.text;
      for (const [cat, keywords] of Object.entries(categories)) {
        keywords.positive.forEach(word => {
          if (text.includes(word)) categoryCounts[cat].positive++;
        });
        keywords.negative.forEach(word => {
          if (text.includes(word)) categoryCounts[cat].negative++;
        });
      }
    }

    // ツイートがなかった場合はダミーのスコアを返す
    if (tweetCount === 0) {
      return res.json({
        scores: [50, 50, 50, 50, 50],
        totalScore: 50
      });
    }

    // 各カテゴリごとにスコアを算出（例：正のキーワードの割合 × 100、両方0の場合は50）
    const scores = Object.keys(categories).map(cat => {
      const pos = categoryCounts[cat].positive;
      const neg = categoryCounts[cat].negative;
      let score = 50;
      if (pos + neg > 0) {
        score = (pos / (pos + neg)) * 100;
      }
      return Math.round(score);
    });

    // 総合点は各カテゴリスコアの平均値
    const totalScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    console.log("ツイート件数:", tweetCount);
    console.log("カテゴリ別カウント:", categoryCounts);
    console.log("計算されたスコア:", scores, "総合点:", totalScore);

    res.json({ scores: scores, totalScore: totalScore });
  } catch (error) {
    console.error("リクエスト処理中のエラー:", error);
    res.status(500).json({ error: "サーバー内部エラーが発生しました" });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動中です`);
});
