# tinyhere

使用命令行压缩图片

Tool for compressing images with cli





#### 1、全局安装/使用（initialization/use）

**npm install tinyhere -g**



第一次使用时，请先在 tinypng 获取 api-key [点击这里](https://tinypng.com/developers) ，输入用户名和邮箱后，到 [个人中心](https://tinypng.com/dashboard/api) 找到你的api-key，然后初始化后就可以使用了

```
$ tinyhere --add 12345678901234567890123456789012
```

For the first time, please get api-key in tinypng [click here](https://tinypng.com/developers), enter your username and email, and go to [user-center](https://tinypng.com/dashboard/api)  Find your api-key and initialize it to use it.





#### 2、使用说明 （usage）

**tinyhere**

在当前目录下，获取目录里的 png、jpg/jpeg 图片，然后进行压缩，覆盖原有图片

In the current directory, get the png, jpg/jpeg images in the directory, and then compress to overwrite the original image.

```
$ tinyhere

// Compress the specified file
$ tinyhere xxx.png aaa.png ccc.jpg
```





**tinyhere deep**

把该目录内的所有图片（含子目录）的图片都进行压缩

Compress the images of all the images (including subdirectories) in the directory

```
$ tinyhere deep
```





**tinyhere --path \<newPath>**

把压缩之后的图片放在另一个目录里（使用相对路径）

Put the compressed image in another directory (using a relative path)

```
$ tinyhere -p(--path) ./src
```





**tinypng --add 12345678901234567890123456789012**

添加其他api-key

Add another api-key

```
$ tinyhere -a(--add) 1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a
```





**tinyhere --delete 12345678901234567890123456789012**

删除指定api-key

Delete the specified api-key

```
$ tinyhere --delete 1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a
```





**tinyhere --list**

显示已储存的api-key

Show stored api-key

```
$ tinyhere -l(--list)
```





**tinyhere --empty**

清空已储存的api-key

Empty stored api-key

```
$ tinyhere --empty
```





**tinypng --help**

查看使用说明





**tinypng --version**

版本说明



### 3、addtion

每次成功/失败 都显示信息，在最后如果存在压缩失败，询问是否把压缩失败的再压一次，选择否之后，询问是否生成错误日志，然后退出

Each time the success/failure is displayed, if there is a compression failure at the end, ask whether to press the compression failure again. After selecting No, ask if the error log is generated, and then exit.
