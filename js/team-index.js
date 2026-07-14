document.addEventListener('DOMContentLoaded', async () => {
  const [config, team] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json'))
  ]);
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);

  document.title = `Equipo | ${config.seo.site_suffix}`;

  UMD.renderFilterableGrid({
    items: team,
    filterEl: null,
    gridEl: document.getElementById('teamGrid'),
    cardBuilder: (m) => UMD.buildTeamCard(m, UMD.rootPath)
  });

  UMD.initReveal();
});
