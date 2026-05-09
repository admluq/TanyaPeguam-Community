import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteSpecificProfile() {
  try {
    // List all profiles to help identify which one to delete
    const allProfiles = await prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        firm: true,
        slug: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('All current profiles:');
    allProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. Name: ${profile.name}`);
      console.log(`   Title: ${profile.title || 'N/A'}`);
      console.log(`   Firm: ${profile.firm || 'N/A'}`);
      console.log(`   Slug: ${profile.slug}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Created: ${profile.createdAt}`);
      console.log(`   Active: ${profile.isActive}`);
      console.log('---');
    });

    if (allProfiles.length === 0) {
      console.log('No profiles found in the database.');
      return;
    }

    // For this script, I'll delete the most recent profile
    // You can modify this to target a specific profile by name, slug, or ID
    const profileToDelete = allProfiles[0]; // Most recent profile
    
    console.log(`\nPreparing to delete profile: ${profileToDelete.name} (ID: ${profileToDelete.id})`);
    
    // First, delete related links (if any)
    const deletedLinks = await prisma.link.deleteMany({
      where: {
        profileId: profileToDelete.id
      }
    });
    
    console.log(`Deleted ${deletedLinks.count} related links`);

    // Then delete the profile
    const deletedProfile = await prisma.profile.delete({
      where: {
        id: profileToDelete.id
      }
    });

    console.log(`Successfully deleted profile: ${deletedProfile.name}`);
    console.log(`Profile ID: ${deletedProfile.id}`);

    // Verify the deletion
    const remainingProfiles = await prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      }
    });

    console.log(`\nRemaining profiles: ${remainingProfiles.length}`);
    remainingProfiles.forEach((profile) => {
      console.log(`- ${profile.name} (${profile.slug})`);
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
deleteSpecificProfile();
