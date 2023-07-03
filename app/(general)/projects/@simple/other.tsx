import type { SimpleProject } from '../interface';

export const other = [
  {
    name: 'website',
    description: 'このサイトです',
    image: 'https://opengraph.githubassets.com/0415/eve0415/website',
    url: 'https://github.com/eve0415/website',
  },
  {
    name: 'CF-Pages-Clean-Deployments-Action',
    description:
      '古くなった Cloudflare Pages のデプロイと紐づいてる GitHub Deployment を無効化する GitHub Action',
    image: 'https://opengraph.githubassets.com/0415/eve0415/CF-Pages-Clean-Deployments-Action',
    url: 'https://github.com/marketplace/actions/cloudflare-pages-clean-deployment-action',
  },
] satisfies readonly SimpleProject[];
