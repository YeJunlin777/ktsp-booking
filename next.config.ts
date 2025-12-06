import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 占位图服务
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      // 阿里云 OSS
      { protocol: "https", hostname: "*.oss-cn-*.aliyuncs.com" },
      { protocol: "https", hostname: "*.oss.aliyuncs.com" },
      // 腾讯云 COS
      { protocol: "https", hostname: "*.cos.*.myqcloud.com" },
      { protocol: "https", hostname: "*.file.myqcloud.com" },
      // AWS S3
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "https", hostname: "s3.*.amazonaws.com" },
      // 七牛云
      { protocol: "https", hostname: "*.qiniudn.com" },
      { protocol: "https", hostname: "*.qnssl.com" },
      // 又拍云
      { protocol: "https", hostname: "*.upaiyun.com" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Unsplash / Pexels / Pinterest (测试图片)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
