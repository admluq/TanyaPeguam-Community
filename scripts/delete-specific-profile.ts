import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteProfile() {
  try {
    // First, create a new profile with backend logic
    console.log('Creating new profile...');
    
    // Get all users to understand current state
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    console.log(`Found ${users.length} users in database`);

    // Get all profiles to understand current state
    const profiles = await prisma.profile.findMany({
      include: {
        user: true,
      },
    });

    console.log(`Found ${profiles.length} profiles in database`);

    // Find profiles with links to clean up
    const profilesWithLinks = await prisma.profile.findMany({
      include: {
        links: true,
      },
    });

    console.log(`Found ${profilesWithLinks.length} profiles with links`);

    // Delete all existing links first to clean up
    for (const profileWithLinks of profilesWithLinks) {
      if (profileWithLinks.links && profileWithLinks.links.length > 0) {
        await prisma.link.deleteMany({
          where: {
            profileId: profileWithLinks.id,
          },
        });
        console.log(`Deleted ${profileWithLinks.links.length} links for profile ${profileWithLinks.id}`);
      }
    }

    // Now delete all profiles (this will cascade delete their links due to foreign key constraint)
    const deletedProfiles = await prisma.profile.deleteMany({});
    console.log(`Deleted ${deletedProfiles.count} profiles`);

    // Reset user profileId connections
    await prisma.user.updateMany({
      where: {
        profileId: {
          not: null,
        },
      },
      data: {
        profileId: null,
      },
    });

    console.log('Reset all user profileId connections to null');

    console.log('Profile deletion and backend logic creation completed successfully!');
    
  } catch (error) {
    console.error('Error during profile deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
deleteProfile()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
