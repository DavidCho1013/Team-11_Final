'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  Bell, 
  Plus, 
  Search,
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Clock,
  MapPin,
  Star,
  Heart,
  Trash2,
  X
} from 'lucide-react'

type TabType = 'board' | 'review' | 'study' | 'notice'

interface Post {
  id: number
  title: string
  content: string
  author: string
  date: string
  likes: number
  comments: number
  views: number
  category?: string
  tags?: string[]
  rating?: number
}

interface StudyGroup {
  id: number
  title: string
  description: string
  subject: string
  members: number
  maxMembers: number
  location: string
  schedule: string
  level: string
  leader: string
  tags: string[]
}

interface Comment {
  id: number
  content: string
  author: string
  date: string
  postId: number
  parentId?: number
}

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [reviewStep, setReviewStep] = useState<'select' | 'write'>('select')
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const [reviewData, setReviewData] = useState({
    rating: 0,
    content: '',
    difficulty: '',
    workload: '',
    recommendation: ''
  })
  const [reviews, setReviews] = useState<Post[]>([])
  const [isWritingPost, setIsWritingPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    category: ''
  })
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [searchOption, setSearchOption] = useState('all')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupData, setGroupData] = useState({
    title: '',
    description: '',
    track: '',
    duration: '',
    maxMembers: '',
    requirements: ''
  })
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [appliedGroups, setAppliedGroups] = useState<number[]>([])
  const [notices, setNotices] = useState<Post[]>([])
  const [selectedNotice, setSelectedNotice] = useState<Post | null>(null)
  const [currentUser, setCurrentUser] = useState<string>('')

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    fetchCourses()
    loadCurrentUser()
    
    // URL 파라미터 확인해서 특정 글 열기
    const postId = searchParams.get('postId')
    const tab = searchParams.get('tab')
    
    if (tab) {
      setActiveTab(tab as TabType)
    }
    
    const sampleReviews: Post[] = [
      {
        id: 1,
        title: "[예시] 인공지능 기초 수강 후기",
        content: "처음 접하는 AI 분야였는데, 교수님이 차근차근 설명해주셔서 이해하기 쉬웠습니다. 과제는 적당했고, 실습 위주라 재미있었어요. 추천합니다!",
        author: "예시사용자1",
        date: "2024-01-15",
        likes: 24,
        comments: 0,
        views: 142,
        tags: ["A1001", "김교수", "추천"],
        rating: 5
      }
    ]
    
    // localStorage에서 사용자가 작성한 수강 후기도 가져오기
    const userReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
    const allReviews = [...sampleReviews, ...userReviews]
    setReviews(allReviews)
    
    const samplePosts: Post[] = [
      {
        id: 1,
        title: "[예시] 2025학년도 1학기 수강신청 꿀팁 공유합니다!",
        content: "수강신청하면서 알게 된 꿀팁들을 공유해드려요. 특히 서버 터지는 시간대 피하는 방법이 중요한데...",
        author: "예시사용자",
        date: "2024-12-20",
        likes: 15,
        comments: 0,
        views: 245,
        category: "정보공유"
      }
    ]
    
    // localStorage에서 사용자가 작성한 글들도 가져오기
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
    const allPosts = [...samplePosts, ...userPosts]
    setPosts(allPosts)
    
    // URL 파라미터로 전달된 글이 있으면 자동으로 열기
    if (postId && tab === 'board') {
      const targetPost = allPosts.find(post => post.id === parseInt(postId))
      if (targetPost) {
        // 약간의 지연을 두고 글을 열어주기 (상태 업데이트 완료 후)
        setTimeout(() => {
          setSelectedPost(targetPost)
        }, 100)
      }
    }
    
    const sampleComments: Comment[] = [
      {
        id: 1,
        content: "정말 유용한 정보네요! 감사합니다 ㅎㅎ",
        author: "예시댓글작성자",
        date: "2024-12-20",
        postId: 1
      }
    ]
    setComments(sampleComments)
    
    const sampleStudyGroups: StudyGroup[] = [
      {
        id: 1,
        title: "[예시] 핵융합 스터디 그룹원 모집",
        description: "핵융합 관련 논문을 읽고 토론하는 스터디입니다.",
        subject: "핵융합",
        members: 3,
        maxMembers: 6,
        location: "도서관 스터디룸",
        schedule: "매주 토요일 14:00-17:00",
        level: "중급",
        leader: "예시리더1",
        tags: ["핵융합", "논문", "토론"]
      },
      {
        id: 2,
        title: "[예시] 수소 에너지 프로젝트 팀원 구해요",
        description: "수소 에너지 관련 프로젝트를 함께 진행할 팀원을 구합니다. 실습 위주로 진행할 예정입니다.",
        subject: "수소 에너지",
        members: 2,
        maxMembers: 4,
        location: "온라인/오프라인 병행",
        schedule: "주 2회 (화, 목)",
        level: "초급-중급",
        leader: "예시리더2",
        tags: ["수소", "프로젝트", "실습"]
      }
         ]
     setStudyGroups(sampleStudyGroups)
     
     const sampleNotices: Post[] = [
       {
         id: 1,
         title: "[예시] [중요] 2025학년도 1학기 수강신청 일정 안내",
         content: "2025학년도 1학기 수강신청 일정을 안내드립니다.\n\n예비수강신청: 12월 23일-27일\n본수강신청: 1월 2일-6일\n\n자세한 사항은 학사 공지사항을 확인해주시기 바랍니다.",
         author: "예시관리자",
         date: "2024-12-20",
         likes: 45,
         comments: 8,
         views: 892,
         category: "학사"
       }
         ]
    setNotices(sampleNotices)
  }, [searchParams, router])

  useEffect(() => {
    filterCourses()
  }, [courses, courseSearchQuery])

  const loadCurrentUser = () => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    if (profile.nickname) {
      setCurrentUser(profile.nickname)
    }
  }

  const isAuthor = (author: string) => {
    return currentUser && author === currentUser
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses)
        setFilteredCourses(data.courses)
      }
    } catch (error) {
      console.error('과목 데이터 로드 중 오류:', error)
    }
  }

  const filterCourses = () => {
    let filtered = courses
    
    if (courseSearchQuery.trim()) {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const courseName = courseKeys[2] ? course[courseKeys[2]].toLowerCase() : ''
        const courseCode = courseKeys[1] ? course[courseKeys[1]].toLowerCase() : ''
        const professor = courseKeys[5] ? course[courseKeys[5]].toLowerCase() : ''
        const searchLower = courseSearchQuery.toLowerCase()
        
        return courseName.includes(searchLower) || 
               courseCode.includes(searchLower) || 
               professor.includes(searchLower)
      })
    }
    
    setFilteredCourses(filtered)
  }

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course)
    setReviewStep('write')
  }

  const handleReviewSubmit = () => {
    if (!selectedCourse || !reviewData.rating || !reviewData.content.trim()) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    // 사용자 프로필에서 별명 가져오기
    const savedProfile = localStorage.getItem('userProfile')
    let authorName = "익명사용자"
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      authorName = profile.nickname || "익명사용자"
    }

    const courseKeys = Object.keys(selectedCourse)
    // 고유한 ID 생성 (현재 시간 기반)
    const uniqueId = Date.now()
    const newReview: Post = {
      id: uniqueId,
      title: `${courseKeys[2] ? selectedCourse[courseKeys[2]] : ''} 수강 후기`,
      content: reviewData.content,
      author: authorName,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
      views: 1,
      rating: reviewData.rating,
      tags: [
        courseKeys[1] ? selectedCourse[courseKeys[1]] : '',
        courseKeys[5] ? selectedCourse[courseKeys[5]] : '',
        reviewData.recommendation
      ].filter(Boolean)
    }

    setReviews([newReview, ...reviews])
    
    // 사용자 활동 추적을 위해 저장
    const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
    allReviews.push(newReview)
    localStorage.setItem('userReviews', JSON.stringify(allReviews))
    
    // 초기화
    setIsWritingReview(false)
    setSelectedCourse(null)
    setReviewStep('select')
    setCourseSearchQuery('')
    setReviewData({
      rating: 0,
      content: '',
      difficulty: '',
      workload: '',
      recommendation: ''
    })
    
    alert('수강 후기가 등록되었습니다!')
  }

  const handleStartReview = () => {
    setIsWritingReview(true)
    setReviewStep('select')
  }

  const handleCancelReview = () => {
    setIsWritingReview(false)
    setSelectedCourse(null)
    setReviewStep('select')
    setCourseSearchQuery('')
    setReviewData({
      rating: 0,
      content: '',
      difficulty: '',
      workload: '',
      recommendation: ''
    })
  }

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('정말로 이 후기를 삭제하시겠습니까?')) {
      // 현재 화면에서 후기 제거
      setReviews(reviews.filter(review => review.id !== reviewId))
      
      // localStorage에서도 제거
      const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
      const updatedReviews = allReviews.filter((review: any) => review.id !== reviewId)
      localStorage.setItem('userReviews', JSON.stringify(updatedReviews))
      
      // 해당 후기의 댓글도 함께 삭제
      setComments(comments.filter(comment => comment.postId !== reviewId))
      
      alert('후기가 삭제되었습니다.')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  const handleStartWritingPost = () => {
    setIsWritingPost(true)
  }

  const handleCancelWritingPost = () => {
    setIsWritingPost(false)
    setPostData({ title: '', content: '', category: '' })
  }

  const handleSubmitPost = () => {
    if (!postData.title.trim() || !postData.content.trim() || !postData.category) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    // 사용자 프로필에서 별명 가져오기
    const savedProfile = localStorage.getItem('userProfile')
    let authorName = "익명사용자"
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      authorName = profile.nickname || "익명사용자"
    }

    // 고유한 ID 생성 (현재 시간 기반)
    const uniqueId = Date.now()
    const newPost: Post = {
      id: uniqueId,
      title: postData.title,
      content: postData.content,
      author: authorName,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
      views: 1,
      category: postData.category
    }

    setPosts([newPost, ...posts])
    
    // 사용자 활동 추적을 위해 저장
    const allPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
    allPosts.push(newPost)
    localStorage.setItem('userPosts', JSON.stringify(allPosts))
    
    setIsWritingPost(false)
    setPostData({ title: '', content: '', category: '' })
    alert('글이 등록되었습니다!')
  }

  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
      setPosts(posts.filter(post => post.id !== postId))
      // 해당 글의 댓글도 함께 삭제
      setComments(comments.filter(comment => comment.postId !== postId))
      
      // localStorage에서도 해당 글 삭제
      const allPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      const updatedPosts = allPosts.filter((post: any) => post.id !== postId)
      localStorage.setItem('userPosts', JSON.stringify(updatedPosts))
      
      alert('글이 삭제되었습니다.')
      // 현재 선택된 글이 삭제된 글이라면 상세보기 창 닫기
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null)
      }
    }
  }

  const handlePostClick = (post: Post) => {
    // 조회수 증가된 post 객체 생성
    const updatedPost = { ...post, views: post.views + 1 }
    setSelectedPost(updatedPost)
    
    // posts 배열에서도 조회수 업데이트
    setPosts(posts.map(p => 
      p.id === post.id ? updatedPost : p
    ))
  }

  const handleLikePost = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 자유게시판 posts 업데이트
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
    
    // 수강 후기 reviews 업데이트
    setReviews(reviews.map(review => 
      review.id === postId ? { ...review, likes: review.likes + 1 } : review
    ))
    
    // 선택된 글이 있고 같은 글이면 업데이트
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 })
    }
  }

  const handleClosePostDetail = () => {
    setSelectedPost(null)
  }

  const handleSubmitComment = () => {
    if (!newComment.trim() || !selectedPost) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    // 사용자 프로필에서 별명 가져오기
    const savedProfile = localStorage.getItem('userProfile')
    let authorName = "익명사용자"
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      authorName = profile.nickname || "익명사용자"
    }

    const comment: Comment = {
      id: Date.now(),
      content: newComment,
      author: authorName,
      date: new Date().toISOString().split('T')[0],
      postId: selectedPost.id
    }

    setComments([...comments, comment])
    setNewComment('')
  }

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      const comment = comments.find(c => c.id === commentId)
      
      // 해당 댓글과 그 댓글의 모든 대댓글 삭제
      const repliesToDelete = getReplies(commentId)
      const totalDeleteCount = 1 + repliesToDelete.length
      
      setComments(comments.filter(c => c.id !== commentId && c.parentId !== commentId))
      alert('댓글이 삭제되었습니다.')
    }
  }

  const getPostComments = (postId: number) => {
    return comments.filter(comment => comment.postId === postId && !comment.parentId)
  }

  const getReplies = (commentId: number) => {
    return comments.filter(comment => comment.parentId === commentId)
  }

  const getFilteredReviews = () => {
    if (!searchQuery.trim()) {
      return reviews
    }

    return reviews.filter(review => {
      const searchLower = searchQuery.toLowerCase()
      
      switch (searchOption) {
        case 'code':
          // 태그에서 과목코드 찾기 (보통 첫 번째 태그가 과목코드)
          return review.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false
        case 'name':
          // 제목에서 과목명 찾기
          return review.title.toLowerCase().includes(searchLower)
        case 'professor':
          // 태그에서 교수명 찾기 (보통 두 번째 태그가 교수명)
          return review.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false
        case 'all':
        default:
          // 전체 검색: 제목, 내용, 태그 모두 포함
          return (
            review.title.toLowerCase().includes(searchLower) ||
            review.content.toLowerCase().includes(searchLower) ||
            review.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
            false
          )
      }
    })
  }

  const handleStartReply = (commentId: number) => {
    setReplyingTo(commentId)
    setReplyContent('')
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !selectedPost || !replyingTo) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    // 사용자 프로필에서 별명 가져오기
    const savedProfile = localStorage.getItem('userProfile')
    let authorName = "익명사용자"
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      authorName = profile.nickname || "익명사용자"
    }

    const reply: Comment = {
      id: Date.now(),
      content: replyContent,
      author: authorName,
      date: new Date().toISOString().split('T')[0],
      postId: selectedPost.id,
      parentId: replyingTo
    }

    setComments([...comments, reply])
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleStartCreatingGroup = () => {
    setIsCreatingGroup(true)
  }

  const handleCancelCreatingGroup = () => {
    setIsCreatingGroup(false)
    setGroupData({ title: '', description: '', track: '', duration: '', maxMembers: '', requirements: '' })
  }

  const handleSubmitGroup = () => {
    if (!groupData.title.trim() || !groupData.description.trim() || !groupData.track || !groupData.duration || !groupData.maxMembers) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    // 사용자 프로필에서 별명 가져오기
    const savedProfile = localStorage.getItem('userProfile')
    let leaderName = "익명사용자"
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      leaderName = profile.nickname || "익명사용자"
    }

    const newGroup: StudyGroup = {
      id: Date.now(),
      title: groupData.title,
      description: groupData.description,
      subject: groupData.track,
      members: 1,
      maxMembers: parseInt(groupData.maxMembers),
      location: "미정",
      schedule: groupData.duration,
      level: "미정",
      leader: leaderName,
      tags: [groupData.track, groupData.requirements].filter(Boolean)
    }

    setStudyGroups([newGroup, ...studyGroups])
    
    // 사용자 활동 추적을 위해 저장
    const allGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]')
    allGroups.push(newGroup)
    localStorage.setItem('userStudyGroups', JSON.stringify(allGroups))
    
    setIsCreatingGroup(false)
    setGroupData({ title: '', description: '', track: '', duration: '', maxMembers: '', requirements: '' })
    alert('스터디 그룹이 등록되었습니다!')
  }

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      setStudyGroups(studyGroups.filter(group => group.id !== groupId))
      setAppliedGroups(appliedGroups.filter(id => id !== groupId))
      alert('그룹이 삭제되었습니다.')
    }
  }

  const handleApplyGroup = (groupId: number) => {
    if (!appliedGroups.includes(groupId)) {
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      
      if (!userProfile.nickname) {
        alert('로그인이 필요한 서비스입니다.')
        return
      }

      // 참여 신청 상태 업데이트
      setAppliedGroups([...appliedGroups, groupId])
      
      // 현재 스터디 그룹 찾기
      const currentGroup = studyGroups.find(group => group.id === groupId)
      
      if (currentGroup) {
        // 사용자의 참여 스터디 그룹에 추가
        const userStudyGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]')
        
        // 이미 참여 중인지 확인
        const isAlreadyJoined = userStudyGroups.some((group: any) => 
          group.id === groupId && (group.leader === userProfile.nickname || group.role === 'member')
        )
        
        if (!isAlreadyJoined) {
          const updatedGroup = {
            ...currentGroup,
            joinedAt: new Date().toISOString(),
            role: currentGroup.leader === userProfile.nickname ? 'leader' : 'member'
          }
          
          userStudyGroups.push(updatedGroup)
          localStorage.setItem('userStudyGroups', JSON.stringify(userStudyGroups))
          
          // 스터디 그룹의 멤버 수 증가
          setStudyGroups(studyGroups.map(group => 
            group.id === groupId 
              ? { ...group, members: group.members + 1 }
              : group
          ))
          
          alert('스터디 그룹에 참여했습니다! 나의 페이지에서 확인하실 수 있습니다.')
        } else {
          alert('이미 참여 중인 스터디 그룹입니다.')
        }
      }
    } else {
      alert('이미 참여 신청한 그룹입니다.')
    }
  }

  const handleDeleteNotice = (noticeId: number) => {
    alert('관리자만 접근 가능합니다.')
  }

  const handleNoticeClick = (notice: Post) => {
    setSelectedNotice(notice)
    // 조회수 증가
    setNotices(notices.map(n => 
      n.id === notice.id ? { ...n, views: n.views + 1 } : n
    ))
  }

  const handleCloseNoticeDetail = () => {
    setSelectedNotice(null)
  }

  const showAdminAlert = () => {
    alert('관리자만 접근 가능합니다.')
  }

  const tabs = [
    { id: 'board' as TabType, name: '자유게시판', icon: MessageSquare, count: posts.length },
    { id: 'review' as TabType, name: '수강 후기', icon: BookOpen, count: reviews.length },
    { id: 'study' as TabType, name: '스터디 그룹 매칭', icon: Users, count: studyGroups.length },
    { id: 'notice' as TabType, name: '공지사항', icon: Bell, count: notices.length }
  ]



  const renderFreeBoard = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">자유게시판</h3>
        <Button onClick={handleStartWritingPost} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          글쓰기
        </Button>
      </div>
      
      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => handlePostClick(post)}>
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    )}
                    {isAuthor(post.author) && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">내 글</Badge>
                    )}
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={(e) => handleLikePost(post.id, e)}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {post.likes}
                      </button>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {comments.filter(c => c.postId === post.id).length}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                </div>
                {isAuthor(post.author) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePost(post.id)
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderReviewBoard = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">수강 후기</h3>
        <Button onClick={handleStartReview} className="bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" />
          후기 작성
        </Button>
      </div>
      
      <div className="space-y-3">
        {getFilteredReviews().map((review) => (
          <Card key={review.id} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isAuthor(review.author) && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">내 후기</Badge>
                        )}
                        <h4 className="text-sm font-medium text-gray-900">{review.title}</h4>
                      </div>
                      {isAuthor(review.author) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReview(review.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* 별점 표시 */}
                    {review.rating && (
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{review.content}</p>
                    
                    {review.tags && (
                      <div className="flex gap-1 mb-2">
                        {review.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {review.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {review.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={(e) => handleLikePost(review.id, e)}
                          className="flex items-center hover:text-red-600 transition-colors"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {review.likes}
                        </button>
                                                  <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {comments.filter(c => c.postId === review.id).length}
                          </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {review.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
          </Card>
        ))}
        
        {getFilteredReviews().length === 0 && searchQuery.trim() && (
          <div className="text-center py-8 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  )

  const renderStudyGroups = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">스터디 그룹 매칭</h3>
        <Button onClick={handleStartCreatingGroup} className="bg-purple-500 hover:bg-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          그룹 만들기
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyGroups.map((group) => (
          <Card key={group.id} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isAuthor(group.leader) && (
                      <Badge variant="default" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">내 그룹</Badge>
                    )}
                    <h4 className="text-sm font-medium text-gray-900">{group.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                </div>
                {isAuthor(group.leader) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-xs text-gray-600">
                  <BookOpen className="h-3 w-3 mr-2" />
                  {group.subject} | {group.level}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-2" />
                  {group.location}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="h-3 w-3 mr-2" />
                  {group.schedule}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Users className="h-3 w-3 mr-2" />
                  {group.members}/{group.maxMembers}명 | 팀장: {group.leader}
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {group.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                size="sm" 
                className="w-full"
                variant={
                  group.members >= group.maxMembers 
                    ? "secondary" 
                    : appliedGroups.includes(group.id)
                      ? "outline"
                      : "default"
                }
                disabled={group.members >= group.maxMembers}
                onClick={() => handleApplyGroup(group.id)}
              >
                {group.members >= group.maxMembers 
                  ? "모집완료" 
                  : appliedGroups.includes(group.id)
                    ? "참여 신청"
                    : "참여하기"
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderNotices = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">공지사항</h3>
        <Button onClick={showAdminAlert} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          글쓰기
        </Button>
      </div>
      
      <div className="space-y-3">
        {notices.map((notice) => (
          <Card key={notice.id} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => handleNoticeClick(notice)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    {isAuthor(notice.author) && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">내 공지</Badge>
                    )}
                    <h4 className="text-sm font-medium text-gray-900">{notice.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {notice.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notice.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {notice.views}
                      </span>
                    </div>
                  </div>
                </div>
                {isAuthor(notice.author) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotice(notice.id)
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">👥 커뮤니티</h1>
          <p className="text-sm text-gray-600">KENTECH 학생들과 소통하고 정보를 공유하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-2">
              <div className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        // 탭 변경 시 모든 작성/상세보기 상태 초기화
                        setActiveTab(tab.id)
                        setIsWritingPost(false)
                        setSelectedPost(null)
                        setIsWritingReview(false)
                        setReplyingTo(null)
                        setPostData({ title: '', content: '', category: '' })
                        setReviewData({ rating: 0, content: '', difficulty: '', workload: '', recommendation: '' })
                        setNewComment('')
                        setReplyContent('')
                        setCourseSearchQuery('')
                        setReviewStep('select')
                        setSelectedCourse(null)
                        setSearchOption('all')
                        setIsCreatingGroup(false)
                        setGroupData({ title: '', description: '', track: '', duration: '', maxMembers: '', requirements: '' })
                        setAppliedGroups([])
                        setSelectedNotice(null)
                      }}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tab.count}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 바 */}
        <div className="mb-6">
        <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                {/* 검색 옵션 (수강 후기일 때만 표시) */}
                {activeTab === 'review' && (
                  <select
                    value={searchOption}
                    onChange={(e) => setSearchOption(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[120px]"
                  >
                    <option value="all">전체</option>
                    <option value="code">과목코드</option>
                    <option value="name">과목명</option>
                    <option value="professor">담당교수</option>
                  </select>
                )}
                
                {/* 검색 입력창 */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={
                      activeTab === 'review' 
                        ? searchOption === 'all' 
                          ? '수강 후기에서 검색...'
                          : searchOption === 'code'
                            ? '과목코드로 검색...'
                            : searchOption === 'name'
                              ? '과목명으로 검색...'
                              : '담당교수로 검색...'
                        : `${tabs.find(t => t.id === activeTab)?.name}에서 검색...`
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="space-y-6">
          {isWritingPost ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">글쓰기</h2>
                    <Button 
                      onClick={handleCancelWritingPost}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>

                  {/* 분야 선택 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">분야 *</label>
                    <select
                      value={postData.category}
                      onChange={(e) => setPostData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">분야를 선택하세요</option>
                      <option value="정보공유">정보공유</option>
                      <option value="질문">질문</option>
                      <option value="일상">일상</option>
                      <option value="공지">공지</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  {/* 제목 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">제목 *</label>
                    <Input
                      type="text"
                      placeholder="제목을 입력하세요..."
                      value={postData.title}
                      onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* 내용 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">내용 *</label>
                    <textarea
                      value={postData.content}
                      onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="내용을 작성해주세요..."
                      className="w-full p-3 border border-gray-300 rounded-md text-sm h-40 resize-none"
                    />
                  </div>

                  {/* 등록 버튼 */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitPost}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedPost ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedPost.category && (
                          <Badge variant="outline" className="text-sm">
                            {selectedPost.category}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-xl font-bold text-gray-900 mb-3">
                        {selectedPost.title}
                      </h1>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {selectedPost.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedPost.date}
                        </span>

                      </div>
                    </div>
                    <Button 
                      onClick={handleClosePostDetail}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 글 내용 */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {selectedPost.content}
                    </div>
                  </div>

                  {/* 좋아요 버튼 섹션 */}
                  <div className="border-t border-gray-200 pt-4 pb-2">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => handleLikePost(selectedPost.id, e)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>좋아요 {selectedPost.likes}</span>
                      </button>
                      <span className="flex items-center space-x-1 text-gray-600">
                        <MessageCircle className="h-4 w-4" />
                        <span>댓글 {comments.filter(c => c.postId === selectedPost.id).length}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>조회 {selectedPost.views}</span>
                      </span>
                    </div>
                  </div>

                  {/* 댓글 섹션 */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      댓글 {comments.filter(c => c.postId === selectedPost.id).length}개
                    </h3>

                    {/* 댓글 작성 */}
                    <div className="mb-6">
                      <div className="flex space-x-3">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 작성해주세요..."
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm h-10 resize-none"
                        />
                        <Button 
                          onClick={handleSubmitComment}
                          className="bg-blue-500 hover:bg-blue-600 h-10 px-4"
                        >
                          등록
                        </Button>
                      </div>
                    </div>

                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                      {getPostComments(selectedPost.id).map((comment) => (
                        <div key={comment.id} className="space-y-3">
                          {/* 원댓글 */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.author}
                                  </span>
                                  {isAuthor(comment.author) && (
                                    <Badge variant="default" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">내 댓글</Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {comment.date}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="flex flex-col items-center space-y-1">
                                {isAuthor(comment.author) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                                <button
                                  onClick={() => handleStartReply(comment.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  답글
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 대댓글 목록 */}
                          {getReplies(comment.id).map((reply) => (
                            <div key={reply.id} className="ml-8 bg-blue-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {reply.author}
                                    </span>
                                    {isAuthor(reply.author) && (
                                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">내 답글</Badge>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {reply.date}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800">
                                    {reply.content}
                                  </p>
                                </div>
                                {isAuthor(reply.author) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* 대댓글 작성 폼 */}
                          {replyingTo === comment.id && (
                            <div className="ml-8">
                              <div className="flex space-x-2">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="답글을 작성해주세요..."
                                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm h-10 resize-none"
                                />
                                <Button 
                                  onClick={handleSubmitReply}
                                  className="bg-blue-500 hover:bg-blue-600 h-10 px-3 text-xs"
                                >
                                  등록
                                </Button>
                                <Button 
                                  onClick={handleCancelReply}
                                  variant="outline"
                                  className="h-10 px-3 text-xs"
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {getPostComments(selectedPost.id).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          첫 번째 댓글을 작성해보세요!
                        </div>
                      )}
                    </div>
              </div>
            </div>
          </CardContent>
        </Card>
          ) : isCreatingGroup ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">스터디 그룹 만들기</h2>
                    <Button 
                      onClick={handleCancelCreatingGroup}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
      </div>

                  {/* 제목 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">제목 *</label>
                    <Input
                      type="text"
                      placeholder="스터디 그룹 제목을 입력하세요..."
                      value={groupData.title}
                      onChange={(e) => setGroupData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* 내용 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">내용 *</label>
                    <textarea
                      value={groupData.description}
                      onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="스터디 그룹에 대한 상세 설명을 작성해주세요..."
                      className="w-full p-3 border border-gray-300 rounded-md text-sm h-32 resize-none"
                    />
                  </div>

                  {/* 상세 선택 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 트랙 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">트랙 *</label>
                      <select
                        value={groupData.track}
                        onChange={(e) => setGroupData(prev => ({ ...prev, track: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">트랙을 선택하세요</option>
                        <option value="환경·기후 기술">환경·기후 기술</option>
                        <option value="에너지 AI">에너지 AI</option>
                        <option value="배터리">배터리</option>
                        <option value="수소">수소</option>
                        <option value="핵융합">핵융합</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    {/* 기간 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">기간 *</label>
                      <select
                        value={groupData.duration}
                        onChange={(e) => setGroupData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">기간을 선택하세요</option>
                        <option value="1주">1주</option>
                        <option value="2주">2주</option>
                        <option value="1개월">1개월</option>
                        <option value="2개월">2개월</option>
                        <option value="한 학기">한 학기</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    {/* 인원 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">인원 *</label>
                      <select
                        value={groupData.maxMembers}
                        onChange={(e) => setGroupData(prev => ({ ...prev, maxMembers: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">인원을 선택하세요</option>
                        <option value="2">2명</option>
                        <option value="3">3명</option>
                        <option value="4">4명</option>
                        <option value="5">5명</option>
                        <option value="6">6명</option>
                        <option value="8">8명</option>
                        <option value="10">10명</option>
                      </select>
                    </div>

                    {/* 기타 모집 조건 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">기타 모집 조건</label>
                      <Input
                        type="text"
                        placeholder="예: 초급자 환영, 논문 읽기 경험 필요 등"
                        value={groupData.requirements}
                        onChange={(e) => setGroupData(prev => ({ ...prev, requirements: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* 등록 버튼 */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitGroup}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isWritingReview ? (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">수강 후기 작성</h2>
                    <Button 
                      onClick={handleCancelReview}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>

                  {reviewStep === 'select' ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">과목 선택</h3>
                      
                      {/* 과목 검색 */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="과목명, 과목코드, 교수명으로 검색..."
                          value={courseSearchQuery}
                          onChange={(e) => setCourseSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* 과목 목록 */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredCourses.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            검색 결과가 없습니다.
                          </div>
                        ) : (
                          filteredCourses.map((course, index) => {
                            const courseKeys = Object.keys(course)
                            return (
                              <Card 
                                key={index}
                                className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleCourseSelect(course)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                                        {courseKeys[2] ? course[courseKeys[2]] : '과목명 없음'}
                                      </h4>
                                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                                        <span>과목코드: {courseKeys[1] ? course[courseKeys[1]] : 'N/A'}</span>
                                        <span>교수: {courseKeys[5] ? course[courseKeys[5]] : 'N/A'}</span>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      선택
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 선택된 과목 정보 */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">선택된 과목</h3>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">
                            {Object.keys(selectedCourse)[2] ? selectedCourse[Object.keys(selectedCourse)[2]] : '과목명 없음'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {Object.keys(selectedCourse)[1] ? selectedCourse[Object.keys(selectedCourse)[1]] : ''} | {' '}
                            {Object.keys(selectedCourse)[5] ? selectedCourse[Object.keys(selectedCourse)[5]] : ''}
                          </p>
                        </div>
                      </div>

                      {/* 별점 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">전체 평점 *</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                              className={`text-2xl transition-colors ${
                                star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            ({reviewData.rating}/5)
                          </span>
                        </div>
                      </div>

                      {/* 추가 평가 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">난이도</label>
                          <select
                            value={reviewData.difficulty}
                            onChange={(e) => setReviewData(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">선택하세요</option>
                            <option value="쉬움">쉬움</option>
                            <option value="보통">보통</option>
                            <option value="어려움">어려움</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">과제량</label>
                          <select
                            value={reviewData.workload}
                            onChange={(e) => setReviewData(prev => ({ ...prev, workload: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">선택하세요</option>
                            <option value="적음">적음</option>
                            <option value="보통">보통</option>
                            <option value="많음">많음</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">추천도</label>
                          <select
                            value={reviewData.recommendation}
                            onChange={(e) => setReviewData(prev => ({ ...prev, recommendation: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">선택하세요</option>
                            <option value="추천">추천</option>
                            <option value="보통">보통</option>
                            <option value="비추천">비추천</option>
                          </select>
                        </div>
                      </div>

                      {/* 후기 내용 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">후기 내용 *</label>
                        <textarea
                          value={reviewData.content}
                          onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="수강 후기를 자세히 작성해주세요..."
                          className="w-full p-3 border border-gray-300 rounded-md text-sm h-32 resize-none"
                        />
                      </div>

                      {/* 등록 버튼 */}
                      <div className="flex justify-end space-x-3">
                        <Button 
                          onClick={() => setReviewStep('select')}
                          variant="outline"
                        >
                          뒤로
                        </Button>
                        <Button 
                          onClick={handleReviewSubmit}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          등록
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === 'board' && renderFreeBoard()}
              {activeTab === 'review' && renderReviewBoard()}
              {activeTab === 'study' && renderStudyGroups()}
              {activeTab === 'notice' && renderNotices()}
            </>
          )}
        </div>

        {/* 공지사항 상세보기 모달 */}
        {selectedNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">공지사항</h3>
                <Button
                  onClick={handleCloseNoticeDetail}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* 제목 */}
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <h1 className="text-xl font-bold text-gray-900">{selectedNotice.title}</h1>
                  </div>
                  
                  {/* 메타 정보 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 border-b border-gray-100 pb-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedNotice.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedNotice.date}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedNotice.views}
                    </span>
                  </div>
                  
                  {/* 내용 */}
                  <div className="prose max-w-none">
                    <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {selectedNotice.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 