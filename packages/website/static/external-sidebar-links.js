// @ts-check

(() => {
  /**
   * @param {(navGroups: Element) => void} callback
   */
  function findNavGroups(callback) {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        const navGroups = document.querySelector('.navGroups');

        if (!navGroups) {
          console.error('The external sidebar links could not be added.');
        } else {
          callback(navGroups);
        }
      },
      {once: true}
    );
  }

  /**
   * @param {Element} navGroups
   * @param {string} title
   * @param {({href: string, name: string})[]} links
   */
  function renderNavGroup(navGroups, title, links) {
    if (navGroups) {
      const navGroup = document.createElement('div');
      navGroup.className = 'navGroup';
      navGroups.appendChild(navGroup);

      const navGroupCategoryTitle = document.createElement('h3');
      navGroupCategoryTitle.className = 'navGroupCategoryTitle';
      navGroupCategoryTitle.innerText = title;
      navGroup.appendChild(navGroupCategoryTitle);

      const navList = document.createElement('ul');
      navGroup.appendChild(navList);

      const navListItem = document.createElement('li');
      navListItem.className = 'navListItem';
      navList.appendChild(navListItem);

      for (const link of links) {
        const navItem = document.createElement('a');
        navItem.className = 'navItem';
        navItem.href = link.href;
        navItem.innerText = link.name;
        navListItem.appendChild(navItem);
      }
    }
  }

  findNavGroups(navGroups =>
    renderNavGroup(
      navGroups,
      'Packages',
      [
        'core',
        'react',
        'module-loader',
        'history-service',
        'server-renderer'
      ].map(name => ({
        href: `/@feature-hub/${name}`,
        name: `@feature-hub/${name}`
      }))
    )
  );
})();
