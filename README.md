# ツールの概要
Twitter(現X)のAPIを用いて漫画の評価を点数にして可視化するツールです。ストーリー、キャラクター、読みやすさ、画力、センスの五つの項目で評価して一項目につき100点の500点満点で点数を算出します。
# なぜ作ったのか
私自身が漫画をよく読むのですが、面白い漫画を探す時にSNSの意見などを参考にするのですが、漫画を評価項目ごとに点数をつけて面白さを具体化したら面白いんじゃないかと考え作成に至りました。
# 使い方
1.新規ファイルを作成し、名前として.envと入力

2.Bearer Token を設定する

作成した .env ファイルを開き、以下のように記述しファイルを保存します。

BEARER_TOKEN=あなたのTwitterBearerToken

（あなたのTwitterBearerToken の部分は、Twitter API の開発者ポータルで取得した実際のBearer Tokenに置き換えてください。）

3.VS Code のターミナルで、server.js が存在するプロジェクトのルートディレクトリに移動しているか確認してください。

例:  cd "C:\Users\PGcca\OneDrive\デスクトップ\ComicPointGenerator

4.npmプロジェクトの初期化とパッケージのインストール
ターミナルに以下を入力

npm init -y

npm install express twitter-api-v2 dotenv

5.サーバーの起動
続いてターミナルに以下を入力

node server.js

ターミナルに「サーバーが http://localhost:3000/ComicPointGenerator/index.html で起動中です」と表示されたことを確認してください。リンクにアクセスしてWEBページが表示されましたら任意の漫画のタイトルを入力して検索を押してください。入力した漫画の面白さが設定した五つの項目に沿って評価されます。

# 注意点

・Twitter APIの問題で月500件までしか投稿を取得することができません。(データ取得中にエラーが発生しました: サーバーエラーが発生しました (500))が表示されると取得上限に達したということになります。

・node server.jsを入力した後にターミナルに「Error: Cannot find module」と表示された場合、server.jsの保存先が間違っていてファイルが参照できていない可能性があります。正しいディレクトリに移動しているか確認してください。解決しない場合server.jsファイルをComicPointGeneratorファイルの外に移動して、ターミナルにnode server.jsを再度入力してください。
