import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'username', nullable: true })
  username: string;

  @Column({ name: 'hebrew_name', nullable: true })
  hebrewName: string;

  @Column({ name: 'full_name_english', nullable: true })
  fullNameEnglish: string;

  @Column({ name: 'embedding', nullable: true })
  embedding: string;

  @Column({ name: 'count', default: 0 })
  count: number;

  @Column({ name: 'history', nullable: true })
  history: string;
}
