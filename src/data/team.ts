// Board roster. Photos live in public/team/ as 4:5 portraits (560×700 works well).
// To update: edit name / role / linkedin, drop a new photo in public/team/, done.

export type Member = {
  name: string
  role: string
  photo: string
  linkedin?: string
}

export const board: Member[] = [
  { name: 'Keshava AK', role: 'Chairperson', photo: 'team/keshava.jpg', linkedin: 'https://www.linkedin.com/in/keshavaak/' },
  { name: 'Amaeya Sesha Narayanan', role: 'Vice Chairperson', photo: 'team/amaeya.jpg', linkedin: 'https://www.linkedin.com/in/amaeya-sesha-narayanan-57490726a/' },
  { name: 'Mohamed Basheer', role: 'Secretary', photo: 'team/basheer.jpg', linkedin: 'https://www.linkedin.com/in/mohamed-basheer/' },
  { name: 'Prakhar Srivastava', role: 'Treasurer', photo: 'team/prakhar.jpg', linkedin: 'https://www.linkedin.com/in/prakhar-s39/' },
  { name: 'Tamil Adhavan', role: 'Technical Lead', photo: 'team/tamil.jpg', linkedin: 'https://www.linkedin.com/in/tamiladhavan/' },
  { name: 'Kanishq Goud', role: 'R&D Lead', photo: 'team/kanishq.jpg', linkedin: 'https://www.linkedin.com/in/kanishq-goud/' },
  { name: 'Shrinesh T M', role: 'Events Lead', photo: 'team/shrinesh.jpg', linkedin: 'https://www.linkedin.com/in/shrinesh-t-m-788a29293/' },
  { name: 'Sarathi Chandran R', role: 'Entrepreneurship Lead', photo: 'team/sarathi.jpg', linkedin: 'https://www.linkedin.com/in/sarathi-chandran-r-10a923323/' },
  { name: 'Akshaya KV', role: 'Public Relations Lead', photo: 'team/akshaya.jpg', linkedin: 'https://www.linkedin.com/in/akshaya-kv-a30877348/' },
  { name: 'Prashanth Reddy', role: 'Social Media Lead', photo: 'team/prashanth.jpg', linkedin: 'https://www.linkedin.com/in/prasanth-reddy-7163a0324/' },
  { name: 'Didhiti Rai', role: 'Industry Connect Lead', photo: 'team/didhiti.jpg', linkedin: 'https://www.linkedin.com/in/didhitirai/' },
  { name: 'Ayisha Hemni K', role: 'Creative Lead', photo: 'team/ayisha.jpg', linkedin: 'https://www.linkedin.com/in/ayisha-hemni-k-952a57287/' },
  { name: 'Aryan Gupta', role: 'Sponsorship Lead', photo: 'team/aryan.jpg' },
]

export const advisors: Member[] = [
  { name: 'Abishai Gosula', role: 'Founding advisor', photo: 'team/abishai.jpg', linkedin: 'https://www.linkedin.com/in/abishai-george-e-gosula/' },
]
