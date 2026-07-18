document.addEventListener('DOMContentLoaded', async () => {
  const [config, portfolio] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json'))
  ]);
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.title = config.seo.title_portfolio_index;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.seo.description_portfolio_index);

  UMD.setCanonical(`${config.brand.site_url}/portfolio/`);
  UMD.setOgMeta('og:title',       config.seo.title_portfolio_index);
  UMD.setOgMeta('og:description', config.seo.description_portfolio_index);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/portfolio/`);
  UMD.setOgMeta('og:type',        'website');
  UMD.setOgMeta('og:site_name',   config.seo.site_name);
  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       config.seo.title_portfolio_index);
  UMD.setTwitterMeta('twitter:description', config.seo.description_portfolio_index);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${config.seo.og_image}`);

  const FILTER_LABELS = config.ui_strings?.categorias_portfolio

  UMD.renderFilterableGrid({
    items: portfolio,
    filterEl: document.getElementById('portfolioFilters'),
    gridEl: document.getElementById('portfolioGrid'),
    categoryField: 'category',
    labels: FILTER_LABELS,
    cardBuilder: (p) => UMD.buildPortfolioCard(p, UMD.rootPath)
  });

  UMD.initReveal();
});
