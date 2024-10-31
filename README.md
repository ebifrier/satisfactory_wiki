
# Xserverでのデプロイについて

Xserverなどの共有ホスティングサービスではプロセスの常駐や、wsgi/apacheのmodなどが使えません。そのため、このサービスではFastCGIを使い、デプロイを行います。


## XserverへのFastCGIインストール方法

1. サーバーにログインする。
1. Anacondaをインストールし、python環境を構築する。
    ```
    wget https://repo.anaconda.com/archive/Anaconda3-2024.10-1-Linux-x86_64.sh
    bash Anaconda3-2024.10-1-Linux-x86_64.sh

    # anacondaへのパスを設定
    echo "PATH=$PATH:~/anaconda3/bin" >> ~/.bashrc
    source ~/.bashrc

    # anacondaの初期化と有効化
    conda init
    conda activate
    ```
