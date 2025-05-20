const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const add = require('../commands/add');
const init = require('../commands/init');

const INDEX_PATH = path.resolve('.mini-git/index.json');
const OBJECTS_DIR = path.resolve('.mini-git/objects');
const TEST_FILE = 'test.txt';

describe('add() 단위 테스트', () => {
  beforeEach(() => {
    init();
    fs.writeFileSync(TEST_FILE, 'test-text, tete🐛');
  });

  afterEach(() => {
    if (fs.existsSync(TEST_FILE)) fs.rmSync(TEST_FILE);
    if (fs.existsSync('.mini-git')) fs.rmSync('.mini-git', { recursive: true });
  });

  test('add()가 실행되면 파일이 해시화되어 .mini-git/objects에 저장된다.', () => {
    add(TEST_FILE);

    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    const hash = index[TEST_FILE];

    const objectPath = path.join(OBJECTS_DIR, hash.slice(0, 2), hash.slice(2));
    expect(fs.existsSync(objectPath)).toBe(true);
  });

  test('add()가 실행되면 index.json에 해당 파일이 "파일명": "해시" 형태로 저장된다.', () => {
    add(TEST_FILE);

    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

    const fileContent = fs.readFileSync(TEST_FILE);
    const header = `blob ${fileContent.length}\0`;
    const store = Buffer.concat([Buffer.from(header), fileContent]);

    const expectedHash = crypto.createHash('sha1').update(store).digest('hex');

    expect(Object.keys(index)).toContain('test.txt');
    expect(index[TEST_FILE]).toBe(expectedHash);
  });

  test('add() 실행 시 존재하지 않는 파일을 추가하면 에러 메시지를 출력한다.', () => {
    if (fs.existsSync(TEST_FILE)) fs.rmSync(TEST_FILE);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    add(TEST_FILE);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(
        `fatal:  '${TEST_FILE}'경로명세가 어떤 파일과도 일치하지 않습니다`
      )
    );
    spy.mockRestore();
  });
});
