# SATISFACTORY Wiki ツール backend

## 概要

SATISFACTORY Wiki ツールページで使う API などのバックエンド処理を行います。
API は python で実装され、素材一覧やその使用先、レシピのリストなどの取得が可能です。

## ビルドや実行方法など

### 前提条件

```
# venv環境がない場合や、requirements.txtを更新した場合は、以下のコマンドを実行します。
just install
```

### コマンド一覧

```
# コマンド一覧を確認
just --list

# ローカル環境での実行
just run

# 本番環境用のビルド
just build

# 本番環境にデプロイ
just deploy
```

## windows での just のインストール方法

just は windows でも使えるタスクランナーです。make がない環境でもコマンドを簡単に実行することができます。

1. https://scoop.sh/ から scoop をインストールします。
1. 以下のコマンドを実行します。 \
   `scoop install just`
