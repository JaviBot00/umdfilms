document.addEventListener('DOMContentLoaded', async () => {
  const [config, team] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json'))
  ]);
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.querySelector('.page-hero .container').insertAdjacentHTML('afterbegin', `
  <a href="${UMD.rootPath('index.html') + '#equipo'}" class="page-back-link reveal">
    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
    ${config.ui_strings.common.volver}
  </a>`);

  document.title = config.seo.title_team_index;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.seo.description_team_index);

  UMD.setCanonical(`${config.brand.site_url}/team/`);
  UMD.setOgMeta('og:title',       config.seo.title_team_index);
  UMD.setOgMeta('og:description', config.seo.description_team_index);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/team/`);
  UMD.setOgMeta('og:type',        'website');
  UMD.setOgMeta('og:site_name',   config.seo.site_name);
  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       config.seo.title_team_index);
  UMD.setTwitterMeta('twitter:description', config.seo.description_team_index);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${config.seo.og_image}`);

  UMD.renderFilterableGrid({
    items: team,
    filterEl: null,
    gridEl: document.getElementById('teamGrid'),
    cardBuilder: (m) => UMD.buildTeamCard(m, UMD.rootPath)
  });

  UMD.initReveal();
});
