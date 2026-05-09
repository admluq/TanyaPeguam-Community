import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicateProfile() {
  try {
    // Find all profiles with name "Adam Luqman"
    const duplicateProfiles = await prisma.profile.findMany({
      where: {
        name: {
          contains: 'Adam Luqman',
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'asc' // Keep the oldest one, delete newer duplicates
      }
    });

    console.log(`Found ${duplicateProfiles.length} profiles matching "Adam Luqman":`);
    duplicateProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}, Name: ${profile.name}, Created: ${profile.createdAt}, Slug: ${profile.slug}`);
    });

    if (duplicateProfiles.length <= 1) {
      console.log('No duplicates found. Only one or zero profiles exist.');
      return;
    }

    // Keep the first (oldest) profile, delete the rest
    const profilesToDelete = duplicateProfiles.slice(1);
    
    console.log(`\nDeleting ${profilesToDelete.length} duplicate profiles...`);
    
    for (const profile of profilesToDelete) {
      // First, delete related links (if any)
      await prisma.link.deleteMany({
        where: {
          profileId: profile.id
        }
      });

      // Then delete the profile
      await prisma.profile.delete({
        where: {
          id: profile.id
        }
      });
      
      console.log(`Deleted profile: ${profile.name} (ID: ${profile.id}, Slug: ${profile.slug})`);
    }

    console.log('\nDuplicate profiles removed successfully!');
    
    // Verify the result
    const remainingProfiles = await prisma.profile.findMany({
      where: {
        name: {
          contains: 'Adam Luqman',
          mode: 'insensitive'
        }
      }
    });
    
    console.log(`\nRemaining profiles: ${remainingProfiles.length}`);
    remainingProfiles.forEach((profile) => {
      console.log(`- ID: ${profile.id}, Name: ${profile.name}, Slug: ${profile.slug}`);
    });

  } catch (error) {
    console.error('Error removing duplicate profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
removeDuplicateProfile();
