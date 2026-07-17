document.addEventListener('DOMContentLoaded', async () => {
  const [config, portfolio] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json'))
  ]);
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.title = `Portfolio | ${config.seo.site_suffix}`;

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
