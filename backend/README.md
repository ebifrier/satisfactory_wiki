# SATISFACTORY Wiki ツール backend

## 概要

SATISFACTORY Wiki ツールページで使う API などのバックエンド処理を行います。
API は python で実装され、素材一覧やその使用先、レシピのリストなどの取得が可能です。

## ビルドや実行方法など

### 前提条件

```
# 動作にはpython3.12が必要です。

# Ubuntuでは以下のコマンドでpython3.12をインストールします。
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12

# pipenvを事前にインストールします。
pip install pipenv
```

### コマンド一覧

```
# コマンド一覧を確認
just --list

# pipenv環境の作成や、requirements.txtを更新した場合
just install

# ローカル環境での実行
just run

# 本番環境用のビルド
just build

# ステージング環境にデプロイ
just deploy-init staging (最初のみ)
just deploy staging

# 本番環境にデプロイ
just deploy-init production (最初のみ)
just deploy production
```

- deploy-init コマンドは 1 度では上手くいかないことがあります。少し時間を置いてから何度か実行してみてください。

## just のインストール方法

just は windows でも使えるタスクランナーです。make がない環境でもコマンドを簡単に実行することができます。

### Ubuntu へのインストール

以下のコマンドを実行します。

```
wget -qO - 'https://proget.makedeb.org/debian-feeds/prebuilt-mpr.pub' | gpg --dearmor | sudo tee /usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg 1> /dev/null

echo "deb [arch=all,$(dpkg --print-architecture) signed-by=/usr/share/keyrings/prebuilt-mpr-archive-keyring.gpg] https://proget.makedeb.org prebuilt-mpr $(lsb_release -cs)" | sudo tee /etc/apt/sources.list.d/prebuilt-mpr.list

sudo apt update

sudo apt install just
```

### windows へのインストール

1. https://scoop.sh/ から scoop をインストールします。
1. 以下のコマンドを実行します。 \
   `scoop install just`
