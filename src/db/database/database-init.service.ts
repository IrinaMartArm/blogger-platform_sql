import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs'; //встроенный модуль Node.js для работы с файлами (чтение, запись и т.д.).
import { join } from 'path';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const filePath = join(process.cwd(), 'src/db', 'init.sql'); //это путь к текущей папке, где находится сам файл
    const sql = fs.readFileSync(filePath, 'utf8'); //читает файл init.sql и возвращает содержимое как текст.

    console.log('Running database initialization script...');
    const queries = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    for (const query of queries) {
      await this.dataSource.query(query);
    }

    await this.dataSource.query(sql); //выполняет этот SQL в PostgreSQL.
    console.log('Database initialized.');
  }
}
