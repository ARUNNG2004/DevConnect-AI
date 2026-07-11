import { doc, getDoc, setDoc } from "firebase/firestore";
import { getServerDb } from "../../../../lib/firebase-admin";

export async function POST(req) {
  try {
    const { userId, postId } = await req.json();

    if (!userId || !postId) {
      return Response.json(
        { error: "userId and postId are required" },
        { status: 400 }
      );
    }

    const db = getServerDb();

    // Verify the post exists
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Update user's recentlyViewed list
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const recentlyViewed = userData.recentlyViewed || [];

    // Store only post IDs (postId is already a string)
    // Avoid duplicate entries & move to the top
    let updatedList = recentlyViewed.filter((id) => id !== postId);
    updatedList.unshift(postId);

    // Keep only the latest 10 viewed posts
    if (updatedList.length > 10) {
      updatedList = updatedList.slice(0, 10);
    }

    await setDoc(userRef, { recentlyViewed: updatedList }, { merge: true });

    return Response.json({
      success: true,
      recentlyViewed: updatedList,
    });
  } catch (error) {
    console.error("Error in /api/posts/view:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const db = getServerDb();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return Response.json({ posts: [] });
    }

    const userData = userSnap.data();
    const recentlyViewedIds = userData.recentlyViewed || [];

    if (recentlyViewedIds.length === 0) {
      return Response.json({ posts: [] });
    }

    // Fetch details of all recently viewed posts
    const postsPromises = recentlyViewedIds.map(async (postId) => {
      try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
          return { id: postDoc.id, ...postDoc.data() };
        }
        return null;
      } catch (err) {
        console.error(`Error fetching post ${postId}:`, err);
        return null;
      }
    });

    const postsResult = await Promise.all(postsPromises);
    const validPosts = postsResult.filter(Boolean);

    return Response.json({ posts: validPosts });
  } catch (error) {
    console.error("Error in GET /api/posts/view:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

