# Portfolio CMS

This is a Strapi CMS for managing your portfolio website content.

## Getting Started

### 1. Start the CMS
```bash
npm run develop
```

### 2. Access the Admin Panel
- Open: http://localhost:1337/admin
- Create your first admin account
- Username: admin
- Email: your-email@example.com
- Password: (create a secure password)

### 3. Content Structure

#### Portfolio (Single Type)
- **Name**: Your full name
- **Tagline**: Professional title/description
- **Bio**: Rich text editor for your bio
- **Location**: Your location
- **Selected Projects**: List of featured projects
- **Social Links**: Your social media links
- **Client Categories**: Organized client work

#### Components

**Project Component:**
- Title: Project name
- Description: Project description
- Link: Project URL
- Image: Project thumbnail

**Social Link Component:**
- Platform: Social media platform name
- URL: Full social media URL
- Username: Your username on that platform

**Client Category Component:**
- Category Name: Client category (e.g., "Technology", "Healthcare")
- Projects: List of projects in that category

### 4. API Endpoints

Once you publish content, it will be available at:
- Portfolio data: `http://localhost:1337/api/portfolio`

### 5. Integration with Frontend

The frontend will fetch data from the CMS API to display dynamic content.

## Development

- **CMS URL**: http://localhost:1337/admin
- **API URL**: http://localhost:1337/api
- **Database**: SQLite (stored in `.tmp/data.db`)

## Deployment

For production, you can deploy this CMS to:
- Railway
- Render
- Heroku
- Your own server

Remember to set environment variables for production!
