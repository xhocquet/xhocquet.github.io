var monsters = [
  {
    name: 'Dreamspore',
    location: 'Ellevar',
    directions: 'Exile: Wilderrun then middle portal.',
    aliases: ['dreamspore', 'ds']
  },
  {
    name: 'King Plush',
    location: 'Galeras',
    directions: 'Dominion: Whitevale then left portal.',
    aliases: ['king', 'plush', 'king plush', 'kp']
  },
  {
    name: 'Kraggar',
    location: 'Algoroc',
    directions: 'Dominion: Whitevale then right portal.',
    aliases: ['kraggar']
  },
  {
    name: 'Zoetic',
    location: 'Wilderrun',
    directions: 'N/A',
    aliases: ['zoetic']
  },
  {
    name: 'King Honeygrave',
    location: 'Auroria',
    directions: 'Exile: Wilderrun then top portal.',
    aliases: ['khg', 'king honeygrave', 'king', 'honeygrave']
  },
  {
    name: 'Tower Engineer Renhakul',
    location: 'Arcterra',
    directions: 'N/A',
    aliases: ['tower engi', 'engi', 'tower engineer', 'renhakul']
  },
  {
    name: 'Frostgale',
    location: 'Arcterra',
    directions: 'N/A',
    aliases: ['frostgale', 'fg']
  },
  {
    name: 'Scorchwing',
    location: 'Blighthaven',
    directions: 'N/A',
    aliases: ['scorchwing', 'sw']
  },
  {
    name: 'Metal Maw',
    location: 'Deradune',
    directions: 'Exile: Wilderrun then bottom portal.',
    aliases: ['mm', 'metal', 'maw', 'metal maw']
  },
  {
    name: 'Grendelus',
    location: 'Celestion',
    directions: 'Dominion: Whitevale then middle portal.',
    aliases: ['grendelus']
  },
  {
    name: 'Metal Maw Prime',
    location: 'Whitevale',
    directions: 'N/A',
    aliases: ['metal', 'maw', 'prime', 'mmp', 'metal maw prime']
  },
  {
    name: 'Gargantua',
    location: 'Defile',
    directions: 'N/A',
    aliases: ['gargantua']
  },
  {
    name: 'Mechathorn',
    location: 'Farside',
    directions: 'N/A',
    aliases: ['mechathorn']
  }
]

var filter = function(term, suggest) {
  term = term.toLowerCase();
  var matches = [];
  for (var i=0; i<monsters.length; i++) {
    var currentBoss = monsters[i];
    var isMatch = false;
    for (var k=0; k<currentBoss.aliases.length; k++) {
      if (currentBoss.aliases[k].indexOf(term) > -1 ) {
        isMatch = true;
      }
    }
    if (isMatch) {
      matches.push(currentBoss.name)
    }
  }
  suggest(matches);
}

var onSelect = function(event, term, item) {
  var selectedMonster = monsters.filter(function(monster) {
    return monster.name == term;
  });

  $('.result-name').text(selectedMonster[0].name);
  $('.result-location').text(selectedMonster[0].location);
  $('.result-directions').text(selectedMonster[0].directions);

  $('.result-map-img').attr('src',selectedMonster[0].location.toLowerCase()+'.jpg');

  $('.results-container').removeClass('hidden');
}

var auto_complete = new autoComplete({
  selector: document.getElementById('monster_search'),
  delay: 100,
  minChars: 2,
  source: filter,
  onSelect: onSelect
});

$('#monster_search').focus();